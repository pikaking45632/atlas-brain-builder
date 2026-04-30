import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MoreVertical, UserPlus, X } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MemberRow {
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  email: string | null;
}

interface InvitationRow {
  id: string;
  email: string | null;
  company_name: string;
  created_at: string;
  uses: number;
  max_uses: number | null;
}

interface TeamViewProps {
  onInviteClick: () => void;
}

export function TeamView({ onInviteClick }: TeamViewProps) {
  const { workspace } = useWorkspace();
  const { user } = useAuth();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<string | null>(null);

  const isAdmin = myRole === "owner" || myRole === "admin";

  async function load() {
    if (!workspace?.id || !user?.id) return;
    setLoading(true);
    setError(null);

    // Members + their profiles. We have to do this in two queries because
    // profiles is keyed by user id and may or may not have a row for everyone.
    const { data: memberRows, error: memErr } = await supabase
      .from("workspace_members")
      .select("user_id, role, joined_at")
      .eq("workspace_id", workspace.id)
      .order("joined_at", { ascending: true });

    if (memErr) {
      setError(memErr.message);
      setLoading(false);
      return;
    }

    const userIds = (memberRows ?? []).map((m) => m.user_id);
    const { data: profileRows } = userIds.length
      ? await supabase
          .from("profiles")
          .select("user_id, display_name, full_name, avatar_url, email")
          .in("user_id", userIds)
      : { data: [] as any[] };

    const profileMap = new Map(
      (profileRows ?? []).map((p: any) => [p.user_id, p]),
    );

    const enriched: MemberRow[] = (memberRows ?? []).map((m) => {
      const profile = profileMap.get(m.user_id);
      return {
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        profile: profile
          ? {
              display_name: profile.display_name ?? profile.full_name ?? null,
              avatar_url: profile.avatar_url ?? null,
            }
          : null,
        email: profile?.email ?? null,
      };
    });

    setMembers(enriched);
    setMyRole(enriched.find((m) => m.user_id === user.id)?.role ?? null);

    // Pending invitations (workspace-scoped invite codes that still have uses left)
    const { data: invRows } = await supabase
      .from("invitations")
      .select("id, company_name, created_at, uses, max_uses")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });

    const pending: InvitationRow[] = ((invRows as any[]) ?? [])
      .filter((r) => (r.uses ?? 0) < (r.max_uses ?? 50))
      .map((r) => ({
        id: r.id,
        email: null,
        company_name: r.company_name,
        created_at: r.created_at,
        uses: r.uses ?? 0,
        max_uses: r.max_uses ?? null,
      }));
    setInvitations(pending);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id, user?.id]);

  async function changeRole(memberUserId: string, newRole: string) {
    if (!workspace?.id) return;
    const { error: updErr } = await supabase
      .from("workspace_members")
      .update({ role: newRole })
      .eq("workspace_id", workspace.id)
      .eq("user_id", memberUserId);
    if (updErr) setError(updErr.message);
    else load();
  }

  async function removeMember(memberUserId: string) {
    if (!workspace?.id) return;
    if (memberUserId === user?.id) return; // can't remove yourself here
    const { error: delErr } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspace.id)
      .eq("user_id", memberUserId);
    if (delErr) setError(delErr.message);
    else load();
  }

  async function revokeInvitation(invitationId: string) {
    const { error: delErr } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId);
    if (delErr) setError(delErr.message);
    else load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Team</h2>
          <p className="text-sm text-slate-500">
            People who have access to this workspace.
          </p>
        </div>
        <Button
          onClick={onInviteClick}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite
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
          Loading team…
        </div>
      ) : (
        <>
          {/* Members */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              Members · {members.length}
            </div>
            <ul className="divide-y divide-slate-100">
              {members.map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Avatar
                    name={m.profile?.display_name || m.email || "?"}
                    url={m.profile?.avatar_url}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {m.profile?.display_name || m.email || "Unknown"}
                      </span>
                      {m.user_id === user?.id && (
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          You
                        </span>
                      )}
                    </div>
                    {m.email && m.profile?.display_name && (
                      <span className="truncate text-xs text-slate-500">
                        {m.email}
                      </span>
                    )}
                  </div>
                  <RolePill role={m.role} />
                  {isAdmin && m.user_id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Member actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {m.role !== "admin" && (
                          <DropdownMenuItem
                            onClick={() => changeRole(m.user_id, "admin")}
                          >
                            Make admin
                          </DropdownMenuItem>
                        )}
                        {m.role !== "member" && m.role !== "owner" && (
                          <DropdownMenuItem
                            onClick={() => changeRole(m.user_id, "member")}
                          >
                            Make member
                          </DropdownMenuItem>
                        )}
                        {m.role !== "owner" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => removeMember(m.user_id)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-700"
                            >
                              Remove from workspace
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Pending invitations */}
          {invitations.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                Pending invitations · {invitations.length}
              </div>
              <ul className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {inv.email ?? `Invite link · ${inv.company_name}`}
                      </span>
                      <p className="text-xs text-slate-500">
                        {`${inv.uses}/${inv.max_uses ?? 50} used · created `}
                        {new Date(inv.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <RolePill role="member" />
                    {isAdmin && (
                      <button
                        onClick={() => revokeInvitation(inv.id)}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Revoke invitation"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
      {initials || "?"}
    </div>
  );
}

function RolePill({ role }: { role: string }) {
  const styles: Record<string, string> = {
    owner: "bg-orange-50 text-orange-700 ring-orange-200",
    admin: "bg-blue-50 text-blue-700 ring-blue-200",
    member: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  const style = styles[role] ?? styles.member;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}
