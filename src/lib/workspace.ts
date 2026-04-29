import type { SupabaseClient } from "@supabase/supabase-js";

interface EnsureWorkspaceArgs {
  name: string;
  industry?: string;
  team_size?: string;
  country?: string;
  business_type?: string;
  selected_modules?: string[];
  plan?: string;
}

/**
 * Idempotently ensures the current user has a workspace. Returns the
 * workspace row, or null if creation failed.
 *
 * Calls the create-workspace Edge Function which:
 *   - Returns the existing workspace_id if the user already has one
 *   - Otherwise atomically creates a new workspace + owner membership
 */
export async function ensureWorkspace(
  client: SupabaseClient,
  args: EnsureWorkspaceArgs,
): Promise<{ id: string } | null> {
  try {
    const { data, error } = await client.functions.invoke("create-workspace", {
      body: args,
    });
    if (error) {
      console.error("ensureWorkspace error:", error);
      return null;
    }
    if (data && (data as any).error) {
      console.error("ensureWorkspace app error:", (data as any).error);
      return null;
    }
    const id = (data as any)?.workspace_id;
    return id ? { id } : null;
  } catch (err) {
    console.error("ensureWorkspace unexpected error:", err);
    return null;
  }
}
