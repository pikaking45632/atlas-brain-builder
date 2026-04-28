import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
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
  const navigate = useNavigate();

  // Step 12 = "all done, send them into the workspace".
  // We don't render a "ThemedDashboard" inside the onboarding state machine
  // any more — the working dashboard lives at /app and is its own route.
  useEffect(() => {
    if (step >= 12) {
      navigate("/app", { replace: true });
    }
  }, [step, navigate]);

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
          {/* Step 8 is now the activation gateway: upload is the ONLY way
              forward, not a skippable side quest. */}
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
