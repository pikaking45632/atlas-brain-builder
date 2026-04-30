import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, FileText, Upload } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocRow {
  id: string;
  title: string | null;
  filename: string | null;
  storage_path: string | null;
  status: string | null;
  created_at: string;
  user_id: string;
}

interface KnowledgeViewProps {
  onUploadClick: () => void;
}

export function KnowledgeView({ onUploadClick }: KnowledgeViewProps) {
  const { workspace } = useWorkspace();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    if (!workspace?.id) return;
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from("documents")
      .select("id, title, filename, storage_path, status, created_at, user_id")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });
    if (fetchErr) setError(fetchErr.message);
    else setDocs((data as DocRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id]);

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    // Delete the row first; storage cleanup is best-effort.
    const { error: deleteErr } = await supabase
      .from("documents")
      .delete()
      .eq("id", pendingDelete.id);
    if (deleteErr) {
      setError(deleteErr.message);
      setDeleting(false);
      setPendingDelete(null);
      return;
    }
    if (pendingDelete.storage_path) {
      await supabase.storage
        .from("documents")
        .remove([pendingDelete.storage_path])
        .catch(() => {
          // Non-fatal; row is already gone.
        });
    }
    setDeleting(false);
    setPendingDelete(null);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Knowledge</h2>
          <p className="text-sm text-slate-500">
            Documents Atlas uses to answer questions about your business.
          </p>
        </div>
        <Button
          onClick={onUploadClick}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload documents
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading documents…
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/40 p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-900">
            No documents yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Atlas can only answer general questions until you upload your first
            document.
          </p>
          <Button
            onClick={onUploadClick}
            className="mt-4 bg-orange-600 hover:bg-orange-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload your first document
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5 font-medium">Document</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Added</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((doc) => (
                <tr key={doc.id} className="text-sm">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {doc.title || doc.filename || "Untitled"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={doc.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(doc.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPendingDelete(doc)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title || pendingDelete?.filename}" will be removed
              from Atlas's knowledge for everyone in this workspace. This can't
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const s = (status ?? "ready").toLowerCase();
  const styles: Record<string, string> = {
    ready: "bg-green-50 text-green-700 ring-green-200",
    processing: "bg-amber-50 text-amber-700 ring-amber-200",
    failed: "bg-red-50 text-red-700 ring-red-200",
    pending: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  const labels: Record<string, string> = {
    ready: "Ready",
    processing: "Processing",
    failed: "Failed",
    pending: "Pending",
  };
  const style = styles[s] ?? styles.pending;
  const label = labels[s] ?? s;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}
