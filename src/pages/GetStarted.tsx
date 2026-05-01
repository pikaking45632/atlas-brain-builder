import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import { useAuth } from "@/components/auth/AuthProvider";
import StepPricing from "@/components/atlas/StepPricing";
import StepWelcome from "@/components/atlas/StepWelcome";
import StepCompany from "@/components/atlas/StepCompany";
import StepWorkplace from "@/components/atlas/StepWorkplace";
import StepModules from "@/components/atlas/StepModules";
import StepReview from "@/components/atlas/StepReview";
import StepPreparing from "@/components/atlas/StepPreparing";
import StepReady from "@/components/atlas/StepReady";

/**
 * Onboarding wizard host.
 *
 * Flow (drives `useOnboarding().step`):
 *   1 Pricing → 2 Account (skipped if already signed in) → 3 Company →
 *   4 Workplace → 5 Modules → 6 Review → 7 Preparing → 8 Ready
 *
 * Workspace creation happens at the final step (StepReady) by calling the
 * `create-workspace` edge function with the wizard data.
 */
export default function GetStarted() {
  const navigate = useNavigate();
  const { user, workspace, loading } = useAuth();
  const { step, setStep } = useOnboarding();

  // If the user already has a workspace, send them straight to the app —
  // the wizard is only for fresh accounts.
  useEffect(() => {
    if (loading) return;
    if (workspace) {
      navigate("/app", { replace: true });
    }
  }, [workspace, loading, navigate]);

  // If the user landed on the auth step but is already signed in, jump
  // forward to the Company step.
  useEffect(() => {
    if (loading) return;
    if (user && step === 2) setStep(3);
    // If they're not signed in and the wizard tries to skip past Account,
    // bounce them back to step 1 so they can pick a plan first.
    if (!user && step > 2) setStep(1);
  }, [user, step, loading, setStep]);

  if (loading) return null;

  return (
    <AnimatePresence mode="wait">
      {step === 1 && <StepPricing key="pricing" />}
      {step === 2 && <StepWelcome key="welcome" />}
      {step === 3 && <StepCompany key="company" />}
      {step === 4 && <StepWorkplace key="workplace" />}
      {step === 5 && <StepModules key="modules" />}
      {step === 6 && <StepReview key="review" />}
      {step === 7 && <StepPreparing key="preparing" />}
      {step === 8 && <StepReady key="ready" />}
    </AnimatePresence>
  );
}
