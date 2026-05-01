import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Check, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface InviteRow {
  id: string;
  email: string;
  role: "member" | "admin";
}

interface InviteResult {
  email: string;
  status: "sent" | "failed" | "already_member";
  error?: string;
}

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
}

function newRow(): InviteRow {
  return {
    id: crypto.randomUUID(),
    email: "",
    role: "member",
  };
}

export function InviteModal({ open, onOpenChange, onSent }: InviteModalProps) {
  const { workspace } = useWorkspace();
  const [rows, setRows] = useState<InviteRow[]>([newRow(), newRow(), newRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<InviteResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setRows([newRow(), newRow(), newRow()]);
    setResults(null);
    setError(null);
    setSubmitting(false);
  }

  function handleClose(next: boolean) {
    if (!next) {
      // Defer reset so the close transition is clean.
      setTimeout(reset, 200);
    }
    onOpenChange(next);
  }

  function updateRow(id: string, patch: Partial<InviteRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));
  }

  function addRow() {
    setRows((rs) => [...rs, newRow()]);
  }

  async function handleSend() {
    setError(null);
    setResults(null);

    const invites = rows
      .map((r) => ({ email: r.email.trim(), role: r.role }))
      .filter((r) => r.email.length > 0);

    if (invites.length === 0) {
      setError("Add at least one email.");
      return;
    }
    if (!workspace?.id) {
      setError("No workspace context.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke(
        "send-invites",
        {
          body: {
            workspace_id: workspace.id,
            invites,
          },
        },
      );

      if (invokeErr) {
        setError(invokeErr.message ?? "Could not send invitations");
        return;
      }
      if ((data as { error?: string })?.error) {
        setError((data as { error: string }).error);
        return;
      }

      setResults((data as { results: InviteResult[] }).results ?? []);
      onSent?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  // Result view ------------------------------------------------------------
  if (results) {
    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const already = results.filter((r) => r.status === "already_member").length;

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invitations sent</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {sent} {sent === 1 ? "invitation was" : "invitations were"} sent.
              {already > 0 && ` ${already} already a member.`}
              {failed > 0 && ` ${failed} failed.`}
            </p>
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-2">
              {results.map((r, i) => (
                <li
                  key={`${r.email}-${i}`}
                  className="flex items-start gap-2 rounded px-2 py-1.5 text-sm"
                >
                  {r.status === "sent" && (
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  )}
                  {r.status === "already_member" && (
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                  )}
                  {r.status === "failed" && (
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{r.email}</div>
                    {r.status === "failed" && r.error && (
                      <div className="text-xs text-red-700">{r.error}</div>
                    )}
                    {r.status === "already_member" && (
                      <div className="text-xs text-slate-500">
                        Already a member of this workspace
                      </div>
                    )}
                    {r.status === "sent" && (
                      <div className="text-xs text-slate-500">
                        Email sent — link valid for 7 days
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={reset}>
                Send more
              </Button>
              <Button
                onClick={() => handleClose(false)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Compose view -----------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite teammates</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-600">
          They'll get an email with a link to join {workspace?.name ?? "your workspace"}.
        </p>

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <Input
                type="email"
                value={row.email}
                onChange={(e) => updateRow(row.id, { email: e.target.value })}
                placeholder="name@company.com"
                disabled={submitting}
                className="flex-1"
              />
              <Select
                value={row.role}
                onValueChange={(v) =>
                  updateRow(row.id, { role: v as "member" | "admin" })
                }
                disabled={submitting}
              >
                <SelectTrigger className="w-32 flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1 || submitting}
                className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Remove row"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={submitting || rows.length >= 25}
          className="inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another
        </button>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">Member</span>: can chat, upload, manage their own work.
            <br />
            <span className="font-medium text-slate-700">Admin</span>: above, plus invite, remove, and manage workspace.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send invitations"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
