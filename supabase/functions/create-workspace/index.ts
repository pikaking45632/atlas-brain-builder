// supabase/functions/create-workspace/index.ts
//
// Atomic workspace + ownership creation.
// Called after sign-up when a user is creating their own organisation
// (open-signup path from the landing page).
//
// Flow:
//   1. Verify the user via their bearer token
//   2. Check they don't already have a workspace
//   3. Insert the workspaces row + workspace_members row in one transaction
//   4. Return the new workspace id
//
// Why an Edge Function rather than two client-side calls:
//   - Atomic: account can't end up half-created
//   - workspace_members has self-restrictive RLS (only admins can insert),
//     so the very first owner row needs service_role to bootstrap.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CreatePayload {
  name?: string;
  industry?: string;
  team_size?: string;
  business_type?: string;
  country?: string;
  selected_modules?: string[];
  plan?: string;
}

const trim = (v: unknown, max = 200) =>
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

    const body = (await req.json()) as CreatePayload;
    const name = trim(body.name, 120);
    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ error: "Workspace name required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Idempotency: if the user already has a workspace, return it instead
    // of creating a duplicate. Means "create-workspace" can be safely retried.
    const { data: existing } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existing?.workspace_id) {
      return new Response(
        JSON.stringify({ workspace_id: existing.workspace_id, existed: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const emailDomain = (user.email || "").split("@")[1] || null;

    // Build a slug from the name. If it collides, the DB default kicks in
    // and gives us a random one.
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    // Atomic workspace + owner-membership creation via Postgres function.
    // If either insert fails, the whole transaction rolls back — no orphans.
    let workspaceId: string | null = null;
    let lastErr: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0
        ? (baseSlug || `ws-${Math.random().toString(36).slice(2, 8)}`)
        : `${baseSlug || "ws"}-${Math.random().toString(36).slice(2, 8)}`;

      const { data, error } = await admin.rpc("create_workspace_with_owner", {
        p_user_id: user.id,
        p_name: name,
        p_slug: slug,
        p_email_domain: emailDomain,
        p_industry: trim(body.industry, 80) || null,
        p_team_size: trim(body.team_size, 30) || null,
        p_country: trim(body.country, 80) || null,
        p_business_type: trim(body.business_type, 80) || null,
        p_selected_modules: Array.isArray(body.selected_modules) ? body.selected_modules : [],
        p_plan: trim(body.plan, 30) || "trial",
      });

      if (!error && data) {
        workspaceId = data as string;
        lastErr = null;
        break;
      }
      lastErr = error;
      if (error?.code !== "23505") break; // non-collision: bail
    }

    if (!workspaceId) {
      console.error("create_workspace_with_owner error:", lastErr);
      return new Response(
        JSON.stringify({ error: "Could not create workspace", details: lastErr?.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Upsert the user's profile so company_name etc are tracked.
    await admin
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          workspace_id: workspaceId,
          company_name: name,
          email_domain: emailDomain,
        },
        { onConflict: "user_id" },
      );

    return new Response(
      JSON.stringify({ workspace_id: workspaceId, existed: false }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("create-workspace unexpected error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
