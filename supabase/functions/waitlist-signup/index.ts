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
    // Skip on duplicates so re-signups don't re-trigger the email.
    if (!alreadyOnList) {
      sendConfirmationEmail(admin, email, companyName).catch((err) => {
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

/**
 * Sends the waitlist confirmation through Lovable Cloud's app-email system
 * (the `send-transactional-email` Edge Function), which renders the
 * `waitlist_confirmation` React Email template, enqueues the send for
 * retry-safe delivery, and respects the suppression list.
 *
 * Best-effort: callers must wrap this in `.catch(...)` — a failure here
 * MUST NOT fail the signup.
 */
async function sendConfirmationEmail(
  admin: ReturnType<typeof createClient>,
  email: string,
  companyName: string | null,
) {
  const idempotencyKey = `waitlist-confirm-${email}`;

  const { data, error } = await admin.functions.invoke(
    "send-transactional-email",
    {
      body: {
        templateName: "waitlist_confirmation",
        recipientEmail: email,
        idempotencyKey,
        templateData: {
          company_name: companyName,
        },
      },
    },
  );

  if (error) {
    throw new Error(
      `send-transactional-email invoke failed: ${error.message ?? error}`,
    );
  }
  console.log("[waitlist-signup] confirmation email queued", {
    email,
    response: data,
  });
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
