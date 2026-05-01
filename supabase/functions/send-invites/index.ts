// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteInput {
  email: string;
  role: "member" | "admin";
}

interface RequestBody {
  workspace_id: string;
  invites: InviteInput[];
}

interface InviteResult {
  email: string;
  status: "sent" | "failed" | "already_member";
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_INVITES_PER_REQUEST = 25;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ----- Auth -----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ??
      Deno.env.get("PUBLIC_SITE_URL") ??
      "";

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error("[send-invites] Missing required env vars");
      return json({ error: "Server misconfigured" }, 500);
    }
    if (!siteUrl) {
      console.error(
        "[send-invites] SITE_URL not set — emails won't have a working join link",
      );
      return json(
        {
          error:
            "SITE_URL env var is not configured on the function. Set it to your app's base URL (e.g. https://atlasintelligencesystems.lovable.app).",
        },
        500,
      );
    }

    // ----- Identify the caller -----
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return json({ error: "Not authenticated" }, 401);
    }
    const caller = userRes.user;

    // ----- Parse + validate input -----
    const body = (await req.json().catch(() => null)) as RequestBody | null;
    if (!body?.workspace_id || !Array.isArray(body.invites)) {
      return json({ error: "Invalid request body" }, 400);
    }

    const workspaceId = String(body.workspace_id);
    const invites = body.invites.slice(0, MAX_INVITES_PER_REQUEST);

    // ----- Authorization: caller must be admin/owner of the workspace -----
    // We do this through the auth client (RLS-respecting) as defence in depth,
    // even though we'll switch to service-role for the inserts.
    const { data: membership, error: memErr } = await authClient
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", caller.id)
      .maybeSingle();

    if (memErr) {
      console.error("[send-invites] membership lookup failed", memErr);
      return json({ error: "Could not verify membership" }, 500);
    }
    if (!membership) {
      return json({ error: "Not a member of this workspace" }, 403);
    }
    if (membership.role !== "owner" && membership.role !== "admin") {
      return json({ error: "Only admins can invite" }, 403);
    }

    // ----- Service-role client for writes + email sending -----
    const admin = createClient(supabaseUrl, serviceKey);

    // Workspace name for the email subject + caller name for personalization.
    const { data: workspace } = await admin
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .maybeSingle();

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", caller.id)
      .maybeSingle();

    const inviterName =
      callerProfile?.display_name?.trim() ||
      caller.email?.split("@")[0] ||
      "A teammate";
    const workspaceName = workspace?.name ?? "Atlas";

    // ----- Process invites -----
    const results: InviteResult[] = [];

    for (const invite of invites) {
      const email = (invite.email ?? "").trim().toLowerCase();
      const role = invite.role === "admin" ? "admin" : "member";

      if (!email || !EMAIL_RE.test(email)) {
        results.push({ email, status: "failed", error: "Invalid email" });
        continue;
      }

      try {
        // Skip if already a member.
        const { data: existingUser } = await admin
          .from("profiles")
          .select("user_id")
          .eq("email", email)
          .maybeSingle();

        if (existingUser?.user_id) {
          const { data: existingMember } = await admin
            .from("workspace_members")
            .select("user_id")
            .eq("workspace_id", workspaceId)
            .eq("user_id", existingUser.user_id)
            .maybeSingle();
          if (existingMember) {
            results.push({ email, status: "already_member" });
            continue;
          }
        }

        // Generate a token. We can't use the DB function here easily because
        // we want it in a single insert, so we generate client-side using
        // the same approach (24 random bytes, base64).
        const tokenBytes = new Uint8Array(24);
        crypto.getRandomValues(tokenBytes);
        const token = btoa(String.fromCharCode(...tokenBytes))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Upsert: if there's already a pending invitation for this
        // (workspace, email), replace it. The unique partial index on
        // (workspace_id, lower(email)) WHERE status = 'pending' makes
        // this safe.
        await admin
          .from("invitations")
          .delete()
          .eq("workspace_id", workspaceId)
          .ilike("email", email)
          .eq("status", "pending");

        const { error: insertErr } = await admin.from("invitations").insert({
          workspace_id: workspaceId,
          email,
          role,
          token,
          status: "pending",
          expires_at: expiresAt.toISOString(),
          invited_by: caller.id,
          // Legacy NOT NULL columns retained on the table.
          company_name: workspaceName,
          email_domain: (email.split("@")[1] || "").toLowerCase(),
        });

        if (insertErr) {
          console.error("[send-invites] insert failed", insertErr);
          results.push({
            email,
            status: "failed",
            error: "Could not create invitation",
          });
          continue;
        }

        // Send the email. Supabase's inviteUserByEmail handles two cases:
        //  - User doesn't exist: creates an auth user and sends invite email
        //    with a magic link that signs them in
        //  - User exists: sends them an email anyway (we need this for
        //    cross-workspace invites, but the link still routes them to /join)
        const joinUrl = `${siteUrl.replace(/\/$/, "")}/join/${encodeURIComponent(token)}`;

        const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
          email,
          {
            redirectTo: joinUrl,
            data: {
              workspace_id: workspaceId,
              workspace_name: workspaceName,
              inviter_name: inviterName,
              invitation_token: token,
            },
          },
        );

        if (inviteErr) {
          // If user already exists, inviteUserByEmail may fail. Fall back
          // to magic-link generation which works for existing users.
          console.warn(
            "[send-invites] inviteUserByEmail failed, trying magiclink",
            inviteErr.message,
          );

          const { error: linkErr } = await admin.auth.admin.generateLink({
            type: "magiclink",
            email,
            options: { redirectTo: joinUrl },
          });

          if (linkErr) {
            console.error("[send-invites] generateLink also failed", linkErr);
            results.push({
              email,
              status: "failed",
              error: linkErr.message,
            });
            continue;
          }
        }

        results.push({ email, status: "sent" });
      } catch (e: any) {
        console.error("[send-invites] per-invite error", e);
        results.push({
          email,
          status: "failed",
          error: e?.message ?? "Unknown error",
        });
      }
    }

    return json({ ok: true, results });
  } catch (e: any) {
    console.error("[send-invites] unhandled", e);
    return json({ error: "Unhandled error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
