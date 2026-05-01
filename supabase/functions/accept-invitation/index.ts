// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "Server misconfigured" }, 500);
    }

    // Identify caller from JWT.
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return json({ error: "Not authenticated" }, 401);
    }
    const caller = userRes.user;
    const callerEmail = caller.email ?? "";

    if (!callerEmail) {
      return json({ error: "User has no email on file" }, 400);
    }

    // Parse token.
    const body = (await req.json().catch(() => null)) as
      | { token?: string }
      | null;
    const token = body?.token?.trim();
    if (!token) return json({ error: "Missing token" }, 400);

    // Call the atomic accept_invitation function.
    const admin = createClient(supabaseUrl, serviceKey);
    const { data, error } = await admin.rpc("accept_invitation", {
      p_token: token,
      p_user_id: caller.id,
      p_user_email: callerEmail,
    });

    if (error) {
      // Map specific exceptions to user-facing errors.
      const msg = (error.message ?? "").toLowerCase();
      if (msg.includes("invitation_not_found")) {
        return json({ error: "invitation_not_found" }, 404);
      }
      if (msg.includes("invitation_already_accepted")) {
        return json({ error: "invitation_already_accepted" }, 410);
      }
      if (msg.includes("invitation_revoked")) {
        return json({ error: "invitation_revoked" }, 410);
      }
      if (msg.includes("invitation_expired")) {
        return json({ error: "invitation_expired" }, 410);
      }
      if (msg.includes("invitation_email_mismatch")) {
        return json({ error: "invitation_email_mismatch" }, 403);
      }
      console.error("[accept-invitation] rpc error", error);
      return json({ error: "Could not accept invitation" }, 500);
    }

    // data is the workspace_id returned from the function.
    return json({ ok: true, workspace_id: data });
  } catch (e: any) {
    console.error("[accept-invitation] unhandled", e);
    return json({ error: "Unhandled error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
