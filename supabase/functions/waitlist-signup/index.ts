// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FILL_TIME_MS = 1500; // bots typically submit instantly

interface RequestBody {
  email?: string;
  company_name?: string | null;
  source?: string | null;
  /** Honeypot field — should always be empty for real users. */
  website?: string;
  /** Time-on-page in ms before submit. */
  fill_time_ms?: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("[waitlist-signup] Missing Supabase env vars");
      return json({ error: "Server misconfigured" }, 500);
    }

    const body = (await req.json().catch(() => null)) as RequestBody | null;
    if (!body) return json({ error: "Invalid request body" }, 400);

    // ---- Bot protection ----
    if (body.website && body.website.trim().length > 0) {
      // Honeypot tripped. Pretend success so bots don't learn the trick.
      console.log("[waitlist-signup] honeypot tripped");
      return json({ ok: true, status: "ok" });
    }
    if (
      typeof body.fill_time_ms === "number" &&
      body.fill_time_ms < MIN_FILL_TIME_MS
    ) {
      // Suspiciously fast. Same silent-success treatment.
      console.log("[waitlist-signup] form filled too fast", body.fill_time_ms);
      return json({ ok: true, status: "ok" });
    }

    // ---- Validation ----
    const email = (body.email ?? "").trim().toLowerCase();
    const companyName = body.company_name?.trim() || null;
    const source = body.source?.trim() || null;

    if (!email || !EMAIL_RE.test(email)) {
      return json({ error: "Please enter a valid email address" }, 400);
    }
    if (email.length > 254) {
      return json({ error: "Email is too long" }, 400);
    }
    if (companyName && companyName.length > 200) {
      return json({ error: "Company name is too long" }, 400);
    }

    // ---- Capture metadata ----
    const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;
    const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim() || "";
    const ipHash = ip ? await sha256(ip + email) : null;

    // ---- Insert (graceful on dupe) ----
    const admin = createClient(supabaseUrl, serviceKey);
    const { error: insertErr } = await admin
      .from("waitlist_signups")
      .insert({
        email,
        company_name: companyName,
        source,
        user_agent: userAgent,
        ip_hash: ipHash,
      });

    let alreadyOnList = false;
    if (insertErr) {
      // 23505 is unique_violation — duplicate email.
      if ((insertErr as any).code === "23505") {
        alreadyOnList = true;
      } else {
        console.error("[waitlist-signup] insert failed", insertErr);
        return json({ error: "Could not save signup" }, 500);
      }
    }

    // ---- Send confirmation email (best-effort, never blocks) ----
    // Two paths: prefer Resend if RESEND_API_KEY is configured, otherwise
    // fall back to Supabase auth's generateLink which sends a real email
    // through whatever email infra is configured (works on Lovable Cloud
    // and standard Supabase).
    if (!alreadyOnList) {
      sendConfirmationEmail(email, companyName).catch((err) => {
        console.warn("[waitlist-signup] email send failed (non-fatal)", err);
      });
    }

    return json({
      ok: true,
      status: alreadyOnList ? "already_on_list" : "ok",
    });
  } catch (e: any) {
    console.error("[waitlist-signup] unhandled", e);
    return json({ error: "Unhandled error" }, 500);
  }
});

async function sendConfirmationEmail(
  email: string,
  companyName: string | null,
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromAddress =
    Deno.env.get("WAITLIST_FROM_EMAIL") ?? "Atlas <hello@atlas-ai.app>";

  if (resendKey) {
    // Resend path — preferred when configured.
    const subject = "You're on the Atlas waitlist";
    const html = renderEmailHtml(companyName);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Resend ${res.status}: ${body}`);
    }
    return;
  }

  // No Resend key — log so the operator knows email isn't going out yet.
  // We don't try to use Supabase's invite/magic-link APIs here because they
  // create auth users as a side effect, which we don't want for a waitlist.
  console.log(
    "[waitlist-signup] RESEND_API_KEY not set; skipping confirmation email",
  );
}

function renderEmailHtml(companyName: string | null): string {
  const greeting = companyName
    ? `Hi ${escapeHtml(companyName)},`
    : "Hi there,";
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fbfaf5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;color:#0f172a;">
    <h1 style="font-size:24px;font-weight:600;letter-spacing:-0.02em;margin:0 0 16px;">
      You're on the list.
    </h1>
    <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 16px;">
      ${greeting}
    </p>
    <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 16px;">
      Thanks for putting your name down for Atlas — the workplace that thinks with you.
    </p>
    <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 16px;">
      We're letting in early customers in small batches as we make sure Atlas works the way it should for each business. You'll hear from us when it's your turn.
    </p>
    <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px;">
      In the meantime, if you'd like to fast-track a conversation about a pilot, just reply to this email.
    </p>
    <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0;border-top:1px solid #e2e8f0;padding-top:16px;">
      Atlas Intelligence Systems Ltd · Scotland, UK
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
