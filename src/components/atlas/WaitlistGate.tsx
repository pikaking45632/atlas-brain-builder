import { useWaitlistGate } from "@/hooks/useWaitlistGate";
import { WaitlistOverlay } from "@/components/atlas/WaitlistOverlay";

interface WaitlistGateProps {
  children: React.ReactNode;
}

/**
 * Wraps the app's route tree. When the gate is active and the user isn't
 * authorized to bypass (signed in, or on /join/:code), shows the waitlist
 * overlay instead of the routed content.
 *
 * To remove the gate later, set WAITLIST_MODE = false in useWaitlistGate.ts.
 * Or remove this wrapper from App.tsx — both work.
 */
export function WaitlistGate({ children }: WaitlistGateProps) {
  const { showGate, loading } = useWaitlistGate();

  // While auth is settling, render nothing rather than flashing the gate
  // for already-signed-in users on a hard refresh.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf5]" />
    );
  }

  if (showGate) {
    return <WaitlistOverlay />;
  }

  return <>{children}</>;
}
