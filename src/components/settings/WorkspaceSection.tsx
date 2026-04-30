import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";

export function WorkspaceSection() {
  const { user } = useAuth();
  const { workspace, refresh } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const isAdmin = role === "owner" || role === "admin";

  useEffect(() => {
    if (!user || !workspace?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [wsRes, memberRes] = await Promise.all([
        supabase
          .from("workspaces")
          .select("name, logo_url")
          .eq("id", workspace.id)
          .maybeSingle(),
        supabase
          .from("workspace_members")
          .select("role")
          .eq("workspace_id", workspace.id)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      if (wsRes.error) setError(wsRes.error.message);
      else if (wsRes.data) {
        setName(wsRes.data.name ?? "");
        setLogoUrl(wsRes.data.logo_url ?? "");
      }
      if (memberRes.data) setRole(memberRes.data.role);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, workspace?.id]);

  async function handleSave() {
    if (!workspace?.id) return;
    setSaving(true);
    setError(null);
    const { error: updateErr } = await supabase
      .from("workspaces")
      .update({
        name: name.trim() || workspace.name,
        logo_url: logoUrl.trim() || null,
      })
      .eq("id", workspace.id);
    setSaving(false);
    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2400);
    refresh?.();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading workspace…
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Workspace</h2>
        <p className="mt-1 text-sm text-slate-500">
          Settings shared by everyone in {workspace?.name ?? "this workspace"}.
        </p>
      </div>

      {!isAdmin && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            Only workspace admins can edit these settings. Ask your admin to make
            changes.
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ws_name">Workspace name</Label>
          <Input
            id="ws_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ws_logo">Logo URL</Label>
          <Input
            id="ws_logo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://…"
            disabled={!isAdmin}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {isAdmin && (
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
            {savedAt && (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
