// supabase/functions/accept-invitation/index.ts
//
// Called by JoinPage after a user signs up via /join/:code. Atomically:
//   1. Verifies the user via their bearer token
//   2. Looks up the invitation by code
//   3. Validates expiry, uses, email-domain match
//   4. Adds the user to the workspace as a member
//   5. Increments invitation uses
//   6. If the user's email matches a row in invite_emails, marks it accepted
//
// Replaces the manual logic in JoinPage that used direct table writes.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AcceptPayload {
  code?: string;
  job_title?: string;
  key_activities?: string;
}

const trim = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

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

    const body = (await req.json()) as AcceptPayload;
    const code = trim(body.code, 64);
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing invite code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: invitation, error: invErr } = await admin
      .from("invitations")
      .select("id, workspace_id, company_name, email_domain, max_uses, uses, expires_at, invited_by")
      .eq("invite_code", code)
      .maybeSingle();

    if (invErr || !invitation) {
      return new Response(JSON.stringify({ error: "Invalid invitation" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "This invitation has expired" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invitation.max_uses && invitation.uses >= invitation.max_uses) {
      return new Response(JSON.stringify({ error: "This invitation is full" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user's email matches the invite's email_domain (defence in
    // depth — the frontend already enforces this, but never trust the client).
    const userDomain = (user.email || "").split("@")[1];
    if (userDomain && invitation.email_domain && userDomain !== invitation.email_domain) {
      return new Response(
        JSON.stringify({ error: `Email must be @${invitation.email_domain}` }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // If the invitation isn't tied to a workspace yet (legacy data), create
    // one for the inviter so the new joiner has a workspace to land in.
    let workspaceId = invitation.workspace_id;
    if (!workspaceId) {
      const { data: createdWs } = await admin
        .from("workspaces")
        .insert({
          name: invitation.company_name || "My Company",
          email_domain: invitation.email_domain,
          created_by: invitation.invited_by,
          plan: "trial",
        })
        .select("id")
        .single();
      if (createdWs) {
        workspaceId = createdWs.id;
        // Make the original inviter the owner.
        await admin.from("workspace_members").insert({
          workspace_id: workspaceId,
          user_id: invitation.invited_by,
          role: "owner",
        });
        // Backfill the invitation with the workspace id.
        await admin.from("invitations").update({ workspace_id: workspaceId }).eq("id", invitation.id);
      } else {
        return new Response(
          JSON.stringify({ error: "Could not provision workspace" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Add the user as a member (idempotent via the unique constraint).
    const { error: memberErr } = await admin
      .from("workspace_members")
      .upsert(
        { workspace_id: workspaceId, user_id: user.id, role: "member" },
        { onConflict: "workspace_id,user_id" },
      );

    if (memberErr) {
      console.error("membership upsert error:", memberErr);
      return new Response(
        JSON.stringify({ error: "Could not add you to the workspace" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Upsert the profile.
    await admin.from("profiles").upsert(
      {
        user_id: user.id,
        workspace_id: workspaceId,
        company_name: invitation.company_name,
        email_domain: invitation.email_domain,
        invite_code: code,
        job_title: trim(body.job_title, 120) || null,
        key_activities: trim(body.key_activities, 500) || null,
      },
      { onConflict: "user_id" },
    );

    // Increment uses on the invitation.
    await admin.rpc("increment_invitation_uses", { p_invite_code: code });

    // If this user was specifically invited by email, mark that row accepted.
    if (user.email) {
      await admin
        .from("invite_emails")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("invitation_id", invitation.id)
        .eq("recipient_email", user.email.toLowerCase());
    }

    return new Response(
      JSON.stringify({ ok: true, workspace_id: workspaceId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("accept-invitation unexpected error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
