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
import UploadDocuments from "@/components/atlas/UploadDocuments";
import InviteColleagues from "@/components/atlas/InviteColleagues";
import ConnectSources from "@/components/atlas/ConnectSources";

const GetStarted = () => {
  const { step } = useOnboarding();
  const { user, workspace, initialized } = useAuth();
  const navigate = useNavigate();

  // Auth gate: steps 1–7 are anonymous (browse pricing, configure modules).
  // From step 8 onwards (upload, invite, sources) we need a real account so
  // documents/invites are persisted to the right user. If the user hits
  // step 8+ without auth, redirect to sign-up. They land back here when done.
  useEffect(() => {
    if (!initialized) return;
    if (step >= 8 && !user) {
      navigate("/sign-up", { replace: true });
    }
  }, [step, user, initialized, navigate]);

  // If the user already has a workspace, send them straight to /app —
  // they're not in onboarding any more, they're returning to use the product.
  useEffect(() => {
    if (initialized && user && workspace) {
      navigate("/app", { replace: true });
    }
  }, [initialized, user, workspace, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {step === 1  && <StepPricing      key="pricing"   />}
          {step === 2  && <StepWelcome      key="welcome"   />}
          {step === 3  && <StepCompany      key="company"   />}
          {step === 4  && <StepWorkplace    key="workplace" />}
          {step === 5  && <StepModules      key="modules"   />}
          {step === 6  && <StepReview       key="review"    />}
          {step === 7  && <StepPreparing    key="preparing" />}
          {step === 8  && <UploadDocuments  key="upload"    />}
          {step === 9  && <InviteColleagues key="invite"    />}
          {step === 10 && <ConnectSources   key="sources"   />}
          {step === 11 && <StepReady        key="ready"     />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GetStarted;
