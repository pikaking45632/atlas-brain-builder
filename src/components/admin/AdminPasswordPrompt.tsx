import { useEffect, useState } from "react";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SESSION_KEY = "atlas_admin_pwd_v1";

interface AdminPasswordPromptProps {
  /** Called with the password the user entered. Should return ok=true if valid, ok=false + error message otherwise. */
  onSubmit: (password: string) => Promise<{ ok: boolean; error?: string }>;
  /** Called when password validates. */
  onSuccess: (password: string) => void;
}

/**
 * Asks the user for the admin password once per browser session. Stores the
 * password in sessionStorage so the page can re-use it across navigations
 * within the same tab without re-prompting. Closing the tab clears it.
 */
export function AdminPasswordPrompt({
  onSubmit,
  onSuccess,
}: AdminPasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, check sessionStorage. If a password is cached, try it.
  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (!cached) return;
    let cancelled = false;
    (async () => {
      const res = await onSubmit(cached);
      if (cancelled) return;
      if (res.ok) {
        onSuccess(cached);
      } else {
        // Cached password no longer works — clear and force re-entry.
        sessionStorage.removeItem(SESSION_KEY);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Enter the admin password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmit(password);
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, password);
        onSuccess(password);
      } else {
        setError(res.error ?? "Wrong password.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not verify password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf5] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold tracking-tight text-slate-900">
          Admin access
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Enter the admin password to continue.
        </p>

        <div className="mt-6 space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={submitting}
            autoFocus
            autoComplete="off"
          />
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button
            type="submit"
            disabled={submitting || !password}
            className="w-full bg-slate-900 hover:bg-slate-800"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          You'll only be asked once per browser session.
        </p>
      </form>
    </div>
  );
}
