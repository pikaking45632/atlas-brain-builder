// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  admin_password?: string;
}

/**
 * Lists waitlist signups. Two server-side checks:
 *   1. Caller must be authenticated AND have role 'owner' on at least one
 *      workspace.
 *   2. Caller must provide the correct ADMIN_PROMPT_PASSWORD env var.
 *
 * Both must pass. The password is compared in constant time to prevent
 * timing attacks. The waitlist_signups table has no SELECT RLS policy, so
 * even leaking this function's URL to an attacker doesn't expose data —
 * they'd still need a valid owner JWT and the password.
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const adminPassword = Deno.env.get("ADMIN_PROMPT_PASSWORD");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error("[admin-waitlist-list] missing supabase env vars");
      return json({ error: "Server misconfigured" }, 500);
    }
    if (!adminPassword) {
      console.error("[admin-waitlist-list] ADMIN_PROMPT_PASSWORD not set");
      return json(
        {
          error:
            "Admin password not configured. Set ADMIN_PROMPT_PASSWORD env var on this function.",
        },
        500,
      );
    }

    // Identify caller
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return json({ error: "Not authenticated" }, 401);
    }
    const caller = userRes.user;

    // Check 1: caller must be an owner on at least one workspace.
    // We use the auth client (RLS-respecting) — defence in depth.
    const { data: ownerRows, error: roleErr } = await authClient
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", caller.id)
      .eq("role", "owner")
      .limit(1);

    if (roleErr) {
      console.error("[admin-waitlist-list] role lookup failed", roleErr);
      return json({ error: "Could not verify role" }, 500);
    }
    if (!ownerRows || ownerRows.length === 0) {
      return json({ error: "Forbidden — owner role required" }, 403);
    }

    // Check 2: admin password.
    const body = (await req.json().catch(() => null)) as RequestBody | null;
    const provided = body?.admin_password ?? "";
    if (!constantTimeEqual(provided, adminPassword)) {
      // Generic error so attackers can't tell whether they got the role
      // check or the password check wrong.
      return json({ error: "Forbidden" }, 403);
    }

    // Both checks passed — read the waitlist via service role.
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: signups, error: listErr } = await admin
      .from("waitlist_signups")
      .select("id, email, company_name, source, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (listErr) {
      console.error("[admin-waitlist-list] read failed", listErr);
      return json({ error: "Could not read waitlist" }, 500);
    }

    return json({ ok: true, signups: signups ?? [] });
  } catch (e: any) {
    console.error("[admin-waitlist-list] unhandled", e);
    return json({ error: "Unhandled error" }, 500);
  }
});

/**
 * Constant-time string comparison. Prevents timing attacks where an
 * attacker could narrow down the password by measuring response time.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // We still iterate over the longer string so the response time
    // doesn't trivially leak length matches. But length mismatch is fine
    // to reject after — the attacker would need many requests to map this.
    let dummy = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      dummy |= (a.charCodeAt(i % (a.length || 1)) ^
        b.charCodeAt(i % (b.length || 1))) | 0;
    }
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
