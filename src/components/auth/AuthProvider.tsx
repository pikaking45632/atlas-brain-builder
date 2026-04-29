import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBackendClient } from "@/lib/backend";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  email_domain: string | null;
  industry: string | null;
  team_size: string | null;
  business_type: string | null;
  selected_modules: string[] | null;
  plan: string | null;
  role: "owner" | "admin" | "member";
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  workspace: Workspace | null;
  loading: boolean;
  /** True after the initial session check has resolved (or the safety timeout fired). */
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; user: User | null }>;
  signOut: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hard ceiling on how long we'll wait for the initial session check before
 * showing the app anyway. Without this, any hang in supabase.auth.getSession
 * leaves the user stuck on the AuthSplash spinner forever.
 */
const INIT_TIMEOUT_MS = 5000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const initFinishedRef = useRef(false);

  const finishInit = useCallback(() => {
    if (initFinishedRef.current) return;
    initFinishedRef.current = true;
    setInitialized(true);
    setLoading(false);
  }, []);

  const loadWorkspace = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setWorkspace(null);
      return;
    }
    const client = getBackendClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from("workspace_members")
        .select("role, workspaces:workspace_id ( id, name, slug, email_domain, industry, team_size, business_type, selected_modules, plan )")
        .eq("user_id", uid)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data || !data.workspaces) {
        setWorkspace(null);
        return;
      }

      const ws = data.workspaces as any;
      setWorkspace({
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        email_domain: ws.email_domain,
        industry: ws.industry,
        team_size: ws.team_size,
        business_type: ws.business_type,
        selected_modules: ws.selected_modules,
        plan: ws.plan,
        role: data.role as "owner" | "admin" | "member",
      });
    } catch (err) {
      console.error("loadWorkspace error:", err);
      setWorkspace(null);
    }
  }, []);

  useEffect(() => {
    const client = getBackendClient();
    if (!client) {
      console.warn("AuthProvider: no backend client — running unauthenticated.");
      finishInit();
      return;
    }

    // Safety net: if the session check hangs for any reason, force-finish
    // initialization so the app stops showing a spinner.
    const timeoutId = window.setTimeout(() => {
      if (!initFinishedRef.current) {
        console.warn("AuthProvider: init timed out, proceeding without session.");
        finishInit();
      }
    }, INIT_TIMEOUT_MS);

    // 1. Hydrate from the existing session in localStorage.
    client.auth.getSession()
      .then(async ({ data: { session: existing } }) => {
        setSession(existing);
        setUser(existing?.user ?? null);
        if (existing?.user) {
          try { await loadWorkspace(existing.user.id); } catch (e) { console.error(e); }
        }
      })
      .catch((err) => {
        console.error("getSession error:", err);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        finishInit();
      });

    // 2. Subscribe to future auth changes (login, logout, token refresh).
    const { data: subscription } = client.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await loadWorkspace(newSession.user.id);
      } else {
        setWorkspace(null);
      }
    });

    return () => {
      window.clearTimeout(timeoutId);
      subscription?.subscription?.unsubscribe();
    };
  }, [loadWorkspace, finishInit]);

  const signIn = async (email: string, password: string) => {
    const client = getBackendClient();
    if (!client) return { error: "Backend unavailable" };

    setLoading(true);
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { error: error.message };
      if (data.user) await loadWorkspace(data.user.id);
      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const client = getBackendClient();
    if (!client) return { error: "Backend unavailable", user: null };

    setLoading(true);
    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      });
      if (error) return { error: error.message, user: null };
      return { error: null, user: data.user };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const client = getBackendClient();
    if (!client) return;
    await client.auth.signOut();
    setUser(null);
    setSession(null);
    setWorkspace(null);
  };

  const refreshWorkspace = useCallback(async () => {
    if (user?.id) await loadWorkspace(user.id);
  }, [user?.id, loadWorkspace]);

  return (
    <AuthContext.Provider
      value={{ user, session, workspace, loading, initialized, signIn, signUp, signOut, refreshWorkspace }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
