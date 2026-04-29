import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const AuthSplash = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-5 h-5 rounded-full border-2 border-text-tertiary border-t-foreground animate-spin" />
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
  /** If true, also requires the user to belong to a workspace. */
  requireWorkspace?: boolean;
}

/**
 * Wrap routes that require a logged-in user.
 *
 * When `requireWorkspace` is true and the user has no workspace cached,
 * we give the auth provider a short grace period (and trigger a refresh)
 * before bouncing them to /get-started. This catches a race condition:
 * after a brand-new workspace is created via the create-workspace Edge
 * Function, the user may land on /app before the AuthProvider's loadWorkspace
 * has completed — without the grace period, they'd flash bounce.
 */
export const ProtectedRoute = ({ children, requireWorkspace = false }: ProtectedRouteProps) => {
  const { user, workspace, initialized, refreshWorkspace } = useAuth();
  const location = useLocation();
  const [graceElapsed, setGraceElapsed] = useState(false);

  // Trigger one workspace refresh + a 1.5s grace timer when we hit /app
  // without a cached workspace. If the workspace lands during the grace
  // period, the component re-renders and shows children. Otherwise we
  // give up and bounce to /get-started.
  useEffect(() => {
    if (!initialized || !user || !requireWorkspace || workspace) {
      setGraceElapsed(false);
      return;
    }
    refreshWorkspace();
    const timer = setTimeout(() => setGraceElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, [initialized, user, requireWorkspace, workspace, refreshWorkspace]);

  if (!initialized) return <AuthSplash />;

  if (!user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireWorkspace && !workspace) {
    if (!graceElapsed) return <AuthSplash />;
    return <Navigate to="/get-started" replace />;
  }

  return <>{children}</>;
};

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
  /** Where to send the user if they're already logged in. Default /app. */
  to?: string;
}

/** Wrap sign-in / sign-up pages so logged-in users skip them. */
export const RedirectIfAuthenticated = ({ children, to = "/app" }: RedirectIfAuthenticatedProps) => {
  const { user, initialized } = useAuth();
  if (!initialized) return <AuthSplash />;
  if (user) return <Navigate to={to} replace />;
  return <>{children}</>;
};
