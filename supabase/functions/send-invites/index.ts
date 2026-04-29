// supabase/functions/send-invites/index.ts
//
// Sends team invitations. Workspace-aware version.
//   1. Authenticates the caller
//   2. Finds (or creates) the master invitation for their workspace
//   3. Persists each recipient in invite_emails
//   4. Sends magic-link emails via Resend if configured
//
// Replaces the previous version which was tied to user_id, not workspace_id.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InvitePayload {
  invitations: Array<{ email: string; role: "Member" | "Admin" }>;
  origin?: string;
}

const isValidEmail = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length < 255;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorised" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorised" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as InvitePayload;
    const list = Array.isArray(body.invitations) ? body.invitations : [];
    const cleaned = list
      .map((row) => ({
        email: typeof row.email === "string" ? row.email.trim().toLowerCase() : "",
        role: row.role === "Admin" ? "Admin" : "Member",
      }))
      .filter((r) => r.email && isValidEmail(r.email));

    if (cleaned.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: "No valid emails." }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Find the user's workspace (must be a member, ideally an admin/owner).
    const { data: membership } = await admin
      .from("workspace_members")
      .select("workspace_id, role, workspaces:workspace_id ( id, name, email_domain )")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!membership || !membership.workspace_id) {
      return new Response(
        JSON.stringify({ error: "You are not a member of any workspace yet." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!["owner", "admin"].includes(membership.role)) {
      return new Response(
        JSON.stringify({ error: "Only workspace admins can send invitations." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const ws = membership.workspaces as any;
    const companyName = ws?.name || "My Company";
    const emailDomain = ws?.email_domain || (user.email || "").split("@")[1] || "team.atlas";

    // Find or create the workspace's master invitation.
    let { data: invitation } = await admin
      .from("invitations")
      .select("id, invite_code, company_name, email_domain")
      .eq("workspace_id", membership.workspace_id)
      .limit(1)
      .maybeSingle();

    if (!invitation) {
      const { data: created, error: createErr } = await admin
        .from("invitations")
        .insert({
          workspace_id: membership.workspace_id,
          invited_by: user.id,
          email_domain: emailDomain,
          company_name: companyName,
        })
        .select("id, invite_code, company_name, email_domain")
        .single();

      if (createErr || !created) {
        console.error("invitation create error:", createErr);
        return new Response(
          JSON.stringify({ error: "Could not create invitation." }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      invitation = created;
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("CONTACT_FROM_EMAIL") || "onboarding@resend.dev";
    const origin = (body.origin || "https://atlas-brain-builder.lovable.app").replace(/\/$/, "");
    const joinUrl = `${origin}/join/${invitation.invite_code}`;

    let sent = 0;
    let failed = 0;

    for (const row of cleaned) {
      const { error: insertErr } = await admin
        .from("invite_emails")
        .upsert(
          {
            invitation_id: invitation.id,
            invited_by: user.id,
            recipient_email: row.email,
            role: row.role,
            status: "pending",
          },
          { onConflict: "invitation_id,recipient_email" },
        );

      if (insertErr) {
        console.error("invite_emails upsert error:", insertErr);
        failed++;
        continue;
      }

      if (RESEND_API_KEY) {
        try {
          const subject = `${companyName} invited you to Atlas`;
          const text =
            `You've been invited to join ${companyName} on Atlas.\n\n` +
            `Join here: ${joinUrl}\n\n` +
            `Atlas is the AI workspace that knows how your business actually works.`;

          const html =
            `<p>You've been invited to join <strong>${companyName}</strong> on Atlas.</p>` +
            `<p><a href="${joinUrl}" style="display:inline-block;padding:10px 16px;background:#1E293B;color:#fff;text-decoration:none;border-radius:6px;">Join your team</a></p>` +
            `<p style="color:#475569;font-size:13px;">Or paste this link in your browser:<br><code>${joinUrl}</code></p>`;

          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ from: FROM, to: [row.email], subject, text, html }),
          });

          if (r.ok) {
            sent++;
            await admin
              .from("invite_emails")
              .update({ status: "sent", sent_at: new Date().toISOString() })
              .eq("invitation_id", invitation.id)
              .eq("recipient_email", row.email);
          } else {
            failed++;
            await admin
              .from("invite_emails")
              .update({ status: "failed" })
              .eq("invitation_id", invitation.id)
              .eq("recipient_email", row.email);
          }
        } catch (e) {
          console.error("Resend send failed:", e);
          failed++;
        }
      } else {
        sent++; // store-only, treat as success
      }
    }

    return new Response(
      JSON.stringify({ ok: true, sent, failed, joinUrl }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("send-invites unexpected error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
