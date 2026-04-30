// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_FEATURES = new Set([
  "calendar",
  "billing",
  "integrations",
  "security_sso",
  "security_audit_logs",
  "security_scim",
  "knowledge_collections",
]);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnon || !serviceRole) {
      console.error("[feature-waitlist] Missing env vars");
      return json({ error: "Server misconfigured" }, 500);
    }

    // Auth client — uses caller's JWT to identify the user.
    const authClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return json({ error: "Not authenticated" }, 401);
    }
    const user = userRes.user;

    const body = await req.json().catch(() => ({}));
    const featureKey = String(body.feature_key ?? "").trim();
    const note = body.note ? String(body.note).slice(0, 1000) : null;
    const workspaceId = body.workspace_id
      ? String(body.workspace_id)
      : null;

    if (!featureKey || !ALLOWED_FEATURES.has(featureKey)) {
      return json({ error: "Unknown feature_key" }, 400);
    }

    // Service role for the insert so RLS doesn't block on edge cases
    // where the user row isn't yet linked. We still scope to the authenticated user.
    const admin = createClient(supabaseUrl, serviceRole);

    const { error: insertErr } = await admin
      .from("feature_waitlist")
      .upsert(
        {
          user_id: user.id,
          workspace_id: workspaceId,
          feature_key: featureKey,
          email: user.email ?? "",
          note,
        },
        { onConflict: "feature_key,email" },
      );

    if (insertErr) {
      console.error("[feature-waitlist] insert error", insertErr);
      return json({ error: "Failed to record interest" }, 500);
    }

    return json({ ok: true });
  } catch (e: any) {
    console.error("[feature-waitlist] unhandled", e);
    return json({ error: "Unhandled error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
