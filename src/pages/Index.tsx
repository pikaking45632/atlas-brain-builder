import { AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import StepWelcome from "@/components/atlas/StepWelcome";
import StepCompany from "@/components/atlas/StepCompany";
import StepWorkplace from "@/components/atlas/StepWorkplace";
import StepModules from "@/components/atlas/StepModules";
import StepReview from "@/components/atlas/StepReview";
import StepPreparing from "@/components/atlas/StepPreparing";
import Dashboard from "@/components/atlas/Dashboard";

const Index = () => {
  const { step } = useOnboarding();

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {step === 1 && <StepWelcome key="welcome" />}
        {step === 2 && <StepCompany key="company" />}
        {step === 3 && <StepWorkplace key="workplace" />}
        {step === 4 && <StepModules key="modules" />}
        {step === 5 && <StepReview key="review" />}
        {step === 6 && <StepPreparing key="preparing" />}
        {step === 7 && <Dashboard key="dashboard" />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
