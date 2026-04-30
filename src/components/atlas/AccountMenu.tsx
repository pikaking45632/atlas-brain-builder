import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

export function AccountMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      setDisplayName(data.display_name ?? null);
      setAvatarUrl(data.avatar_url ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/sign-in");
  }

  const name = displayName || user?.email?.split("@")[0] || "Account";
  const initial = name.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 rounded-md p-0.5 transition hover:bg-slate-100"
          aria-label="Account menu"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
              {initial}
            </div>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="font-medium text-slate-900">{name}</div>
          <div className="truncate text-xs font-normal text-slate-500">
            {user?.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings#profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
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
