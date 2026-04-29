import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/** Full-page loading splash while auth state is resolving. */
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

/** Wrap routes that require a logged-in user. */
export const ProtectedRoute = ({ children, requireWorkspace = false }: ProtectedRouteProps) => {
  const { user, workspace, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) return <AuthSplash />;

  if (!user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireWorkspace && !workspace) {
    // Logged in but no workspace yet — push them through onboarding.
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
