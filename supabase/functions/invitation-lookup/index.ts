import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return json({ error: "Missing invite code" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("invitations")
      .select("company_name, email_domain, expires_at, uses, max_uses")
      .eq("invite_code", code)
      .maybeSingle();

    if (error) {
      console.error("invitation-lookup error:", error);
      return json({ error: "Lookup failed" }, 500);
    }
    if (!data) return json({ error: "This invite link is invalid." }, 200);

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return json({ error: "This invite link has expired." }, 200);
    }
    if ((data.uses ?? 0) >= (data.max_uses ?? 50)) {
      return json({ error: "This invite link has been fully used." }, 200);
    }

    return json({
      invitation: {
        company_name: data.company_name,
        email_domain: data.email_domain,
      },
    });
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