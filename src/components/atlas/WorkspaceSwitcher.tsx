import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, LogOut, Settings, UserPlus } from "lucide-react";

interface WorkspaceSwitcherProps {
  onInviteClick: () => void;
}

export function WorkspaceSwitcher({ onInviteClick }: WorkspaceSwitcherProps) {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/sign-in");
  }

  const name = workspace?.name ?? "Workspace";
  const logoUrl = (workspace as any)?.logo_url as string | undefined;
  const initial = name.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-lg bg-slate-900 py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          aria-label="Workspace menu"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-6 w-6 rounded object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-xs font-semibold text-slate-900">
              {initial}
            </div>
          )}
          <span className="max-w-[160px] truncate">{name}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <div className="px-2 py-1.5">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Current workspace
          </div>
          <div className="mt-0.5 truncate text-sm font-medium text-slate-900">
            {name}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings#workspace" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Workspace settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onInviteClick}
          className="cursor-pointer"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite teammates
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
