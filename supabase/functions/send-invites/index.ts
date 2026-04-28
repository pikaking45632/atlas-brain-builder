import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Not authenticated" }, 401);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Identify the calling user using their JWT.
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Not authenticated" }, 401);

    const { invitations, origin } = await req.json();
    if (!Array.isArray(invitations) || invitations.length === 0) {
      return json({ error: "No invitations provided" }, 400);
    }

    const admin = createClient(url, serviceKey);

    // Find or create the inviter's invitation row.
    const emailDomain = user.email?.split("@")[1] ?? "";
    const { data: existing } = await admin
      .from("invitations")
      .select("id, invite_code, company_name")
      .eq("invited_by", user.id)
      .limit(1)
      .maybeSingle();

    let invitationId: string;
    let inviteCode: string;
    let companyName: string;

    if (existing) {
      invitationId = existing.id;
      inviteCode = existing.invite_code;
      companyName = existing.company_name;
    } else {
      const { data: profile } = await admin
        .from("profiles")
        .select("company_name")
        .eq("user_id", user.id)
        .maybeSingle();
      companyName = profile?.company_name ?? "My Company";
      const { data: created, error: createErr } = await admin
        .from("invitations")
        .insert({
          invited_by: user.id,
          email_domain: emailDomain,
          company_name: companyName,
        })
        .select("id, invite_code")
        .single();
      if (createErr || !created) {
        console.error("invitation create failed:", createErr);
        return json({ error: "Could not create invitation" }, 500);
      }
      invitationId = created.id;
      inviteCode = created.invite_code;
    }

    const joinUrl = `${origin || ""}/join/${inviteCode}`;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("CONTACT_FROM_EMAIL");
    let sent = 0;
    let failed = 0;

    for (const inv of invitations) {
      const recipient = String(inv?.email ?? "").trim().toLowerCase();
      const role = inv?.role === "Admin" ? "Admin" : "Member";
      if (!isEmail(recipient)) {
        failed++;
        continue;
      }

      // Persist (or upsert) the recipient row first so the dashboard can list it.
      const { error: insertErr } = await admin
        .from("invite_emails")
        .upsert(
          {
            invitation_id: invitationId,
            invited_by: user.id,
            recipient_email: recipient,
            role,
            status: "pending",
          },
          { onConflict: "invitation_id,recipient_email" },
        );
      if (insertErr) {
        console.error("invite_emails upsert failed:", insertErr);
        failed++;
        continue;
      }

      // Try delivery via Resend if configured. If not, count as sent —
      // recipients can still be invited via the shared link.
      let delivered = true;
      if (resendKey && fromEmail) {
        try {
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [recipient],
              reply_to: user.email ?? undefined,
              subject: `${user.email ?? "A colleague"} invited you to ${companyName} on Atlas`,
              text: [
                `You've been invited to join ${companyName}'s Atlas workspace as ${role}.`,
                "",
                `Accept here: ${joinUrl}`,
                "",
                "Atlas is the workplace AI that reads your team's documents and answers from them — never from the open internet.",
              ].join("\n"),
            }),
          });
          delivered = r.ok;
        } catch (e) {
          console.error("resend send failed:", e);
          delivered = false;
        }
      }

      await admin
        .from("invite_emails")
        .update({
          status: delivered ? "sent" : "failed",
          sent_at: new Date().toISOString(),
        })
        .eq("invitation_id", invitationId)
        .eq("recipient_email", recipient);

      if (delivered) sent++;
      else failed++;
    }

    return json({ sent, failed, invite_code: inviteCode });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}