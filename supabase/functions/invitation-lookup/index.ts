// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Looks up an invitation by token. Anonymous endpoint — no auth required —
 * because the join page renders BEFORE the user signs in.
 *
 * Returns ONLY display info: workspace name, inviter name, invitee email,
 * role, expiry. Never exposes data that could be used to enumerate other
 * invitations or workspaces.
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Server misconfigured" }, 500);
    }

    const body = (await req.json().catch(() => null)) as
      | { token?: string }
      | null;
    const token = body?.token?.trim();
    if (!token) return json({ error: "Missing token" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);

    // Lookup by token.
    const { data: invitation, error: invErr } = await admin
      .from("invitations")
      .select(
        "id, workspace_id, email, role, status, expires_at, invited_by",
      )
      .eq("token", token)
      .maybeSingle();

    if (invErr) {
      console.error("[invitation-lookup] query failed", invErr);
      return json({ error: "Lookup failed" }, 500);
    }
    if (!invitation) {
      return json({ error: "invitation_not_found" }, 404);
    }

    // Resolve workspace name + inviter display name in parallel.
    const [wsRes, inviterRes] = await Promise.all([
      admin
        .from("workspaces")
        .select("name")
        .eq("id", invitation.workspace_id)
        .maybeSingle(),
      invitation.invited_by
        ? admin
            .from("profiles")
            .select("display_name, email")
            .eq("id", invitation.invited_by)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const inviter = inviterRes.data as
      | { display_name: string | null; email: string | null }
      | null;

    return json({
      ok: true,
      workspace_name: wsRes.data?.name ?? "an Atlas workspace",
      invitee_email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
      inviter_name:
        inviter?.display_name?.trim() ||
        inviter?.email?.split("@")[0] ||
        "Someone",
    });
  } catch (e: any) {
    console.error("[invitation-lookup] unhandled", e);
    return json({ error: "Unhandled error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
