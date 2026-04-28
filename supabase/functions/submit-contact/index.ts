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
    const body = await req.json();
    const { name, email, company, team_size, message, source, website } = body ?? {};

    // Honeypot — bots fill the hidden "website" field.
    if (typeof website === "string" && website.trim().length > 0) {
      return json({ ok: true });
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return json({ error: "Name is required." }, 400);
    }
    if (!email || typeof email !== "string" || !isEmail(email)) {
      return json({ error: "A valid work email is required." }, 400);
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return json({ error: "Tell us a little more about what you're solving." }, 400);
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const ip_hash = ip
      ? Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip)),
          ),
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .slice(0, 32)
      : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("contact_submissions").insert({
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 200),
      company: company ? String(company).trim().slice(0, 200) : null,
      team_size: team_size ? String(team_size).slice(0, 32) : null,
      message: message.trim().slice(0, 2000),
      source: source ? String(source).slice(0, 64) : "landing_page",
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      ip_hash,
    });

    if (error) {
      console.error("submit-contact insert error:", error);
      return json({ error: "Could not submit message." }, 500);
    }

    // Optional: deliver via Resend if configured. Failure here is non-fatal —
    // submission is already persisted in the database.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const to = Deno.env.get("CONTACT_DESTINATION_EMAIL");
    const from = Deno.env.get("CONTACT_FROM_EMAIL");
    if (resendKey && to && from) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [to],
            reply_to: email,
            subject: `New Atlas contact — ${name}${company ? ` (${company})` : ""}`,
            text: [
              `Name: ${name}`,
              `Email: ${email}`,
              company ? `Company: ${company}` : null,
              team_size ? `Team size: ${team_size}` : null,
              source ? `Source: ${source}` : null,
              "",
              message,
            ]
              .filter(Boolean)
              .join("\n"),
          }),
        });
      } catch (e) {
        console.error("resend deliver failed:", e);
      }
    }

    return json({ ok: true });
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