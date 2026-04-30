import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Compatibility hook for components that expect a separate workspace hook.
 * Pulls the workspace from the AuthProvider and exposes a `refresh` method.
 */
export function useWorkspace() {
  const { workspace, refreshWorkspace } = useAuth();
  // Decorate with logo_url so consumers that read it stay typed (the column
  // exists on the DB after the latest migration; the AuthProvider Workspace
 // type doesn't include it, so we expose it as a loose record here).
  return {
    workspace: workspace as (typeof workspace & { logo_url?: string | null }) | null,
    refresh: refreshWorkspace,
  };
}