import { useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Single source of truth for whether the waitlist gate should be shown.
 *
 * To remove the gate entirely later, just set WAITLIST_MODE to false (or
 * remove the WaitlistGate wrapper from App.tsx). All gate-related code
 * stays in place but becomes inert.
 *
 * Bypass rules:
 *   - Anyone signed in (real authenticated session) sees the real app.
 *     This covers founders, team, and users who joined via invitation.
 *   - The /join/:code route is always accessible (otherwise invitation
 *     acceptance is broken).
 */
export const WAITLIST_MODE = true;

export function useWaitlistGate() {
  const { user, initialized } = useAuth();
  const location = useLocation();

  if (!WAITLIST_MODE) {
    return { showGate: false, loading: false };
  }

  // Always allow these routes through the gate, even for anonymous visitors:
  //   /join/:code  — invited users accepting their invitation
  //   /sign-in     — existing customers signing in to bypass the gate
  //   /sign-up     — invited users completing sign-up after clicking through /join
  const ALWAYS_OPEN_PATHS = ["/join/", "/sign-in", "/sign-up", "/admin"];
  if (ALWAYS_OPEN_PATHS.some((p) => location.pathname.startsWith(p))) {
    return { showGate: false, loading: false };
  }

  // Wait for the initial auth check to complete before deciding.
  if (!initialized) {
    return { showGate: false, loading: true };
  }

  // Signed-in users bypass the gate.
  if (user) {
    return { showGate: false, loading: false };
  }

  return { showGate: true, loading: false };
}
