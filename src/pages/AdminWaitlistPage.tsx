import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Download,
  AlertCircle,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AdminPasswordPrompt } from "@/components/admin/AdminPasswordPrompt";

interface Signup {
  id: string;
  email: string;
  company_name: string | null;
  source: string | null;
  created_at: string;
}

type SortKey = "created_at" | "email" | "company_name";
type SortDir = "asc" | "desc";

export default function AdminWaitlistPage() {
  const { user, initialized } = useAuth();
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Verify password by calling the edge function. Returns whether it was accepted.
  async function verifyPassword(
    password: string,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-waitlist-list",
        { body: { admin_password: password } },
      );
      if (error) return { ok: false, error: error.message };
      const errorMsg = (data as { error?: string })?.error;
      if (errorMsg) return { ok: false, error: errorMsg };
      // Successful response — cache the data we just got too.
      const fresh = (data as { signups?: Signup[] })?.signups ?? [];
      setSignups(fresh);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error" };
    }
  }

  async function refresh() {
    if (!adminPassword) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke(
        "admin-waitlist-list",
        { body: { admin_password: adminPassword } },
      );
      if (invokeErr) {
        setError(invokeErr.message);
        return;
      }
      const errorMsg = (data as { error?: string })?.error;
      if (errorMsg) {
        setError(errorMsg);
        return;
      }
      setSignups((data as { signups?: Signup[] })?.signups ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (adminPassword) {
      // We already have data from verifyPassword's response, but refresh on
      // navigation to make sure it's current.
      // (Skipped on first mount because verifyPassword already populated.)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPassword]);

  // While auth is initialising, render nothing
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf5]">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <DeniedScreen
        title="Sign in required"
        message="The admin area requires you to be signed in."
        ctaHref="/sign-in"
        ctaLabel="Sign in"
      />
    );
  }

  // Need admin password
  if (!adminPassword) {
    return (
      <AdminPasswordPrompt
        onSubmit={verifyPassword}
        onSuccess={(pwd) => setAdminPassword(pwd)}
      />
    );
  }

  // Filter + sort
  const visible = [...signups]
    .filter((s) => {
      if (!filter.trim()) return true;
      const q = filter.toLowerCase();
      return (
        s.email.toLowerCase().includes(q) ||
        (s.company_name?.toLowerCase().includes(q) ?? false)
      );
    })
    .sort((a, b) => {
      const av = (a[sortKey] ?? "") as string;
      const bv = (b[sortKey] ?? "") as string;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "created_at" ? "desc" : "asc");
    }
  }

  function exportCsv() {
    const header = ["Email", "Company", "Source", "Signed up"];
    const rows = visible.map((s) => [
      s.email,
      s.company_name ?? "",
      s.source ?? "",
      new Date(s.created_at).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) =>
            /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas-waitlist-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#fbfaf5]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Atlas
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Waitlist
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {signups.length}{" "}
              {signups.length === 1 ? "signup" : "signups"} so far
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button
              onClick={exportCsv}
              size="sm"
              disabled={signups.length === 0}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by email or company…"
              className="pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <Th onClick={() => toggleSort("email")} active={sortKey === "email"} dir={sortDir}>
                  Email
                </Th>
                <Th onClick={() => toggleSort("company_name")} active={sortKey === "company_name"} dir={sortDir}>
                  Company
                </Th>
                <Th onClick={() => toggleSort("created_at")} active={sortKey === "created_at"} dir={sortDir}>
                  Signed up
                </Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    {signups.length === 0
                      ? "No signups yet."
                      : "No signups match this filter."}
                  </td>
                </tr>
              ) : (
                visible.map((s) => (
                  <tr key={s.id} className="text-sm">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {s.email}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {s.company_name || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(s.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: SortDir;
}) {
  return (
    <th
      onClick={onClick}
      className="cursor-pointer select-none px-4 py-2.5 text-left font-medium transition hover:text-slate-900"
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {active && (
          <span className="text-slate-400">
            {dir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </th>
  );
}

function DeniedScreen({
  title,
  message,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  message: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf5] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <ShieldAlert className="h-5 w-5 text-amber-700" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <Link
          to={ctaHref}
          className="mt-5 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
