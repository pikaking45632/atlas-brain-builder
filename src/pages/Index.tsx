import { AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import StepPricing from "@/components/atlas/StepPricing";
import StepWelcome from "@/components/atlas/StepWelcome";
import StepCompany from "@/components/atlas/StepCompany";
import StepWorkplace from "@/components/atlas/StepWorkplace";
import StepModules from "@/components/atlas/StepModules";
import StepReview from "@/components/atlas/StepReview";
import StepPreparing from "@/components/atlas/StepPreparing";
import Dashboard from "@/components/atlas/Dashboard";
import UploadDocuments from "@/components/atlas/UploadDocuments";
import InviteColleagues from "@/components/atlas/InviteColleagues";
import ConnectSources from "@/components/atlas/ConnectSources";
import ThemedDashboard from "@/components/atlas/ThemedDashboard";

const Index = () => {
  const { step } = useOnboarding();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="ambient-orb" style={{ top: "-200px", left: "-100px" }} />
      <div className="ambient-orb" style={{ bottom: "-200px", right: "-100px", animationDelay: "3s" }} />
      <div className="noise-overlay" />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && <StepWelcome key="welcome" />}
          {step === 2 && <StepCompany key="company" />}
          {step === 3 && <StepWorkplace key="workplace" />}
          {step === 4 && <StepModules key="modules" />}
          {step === 5 && <StepReview key="review" />}
          {step === 6 && <StepPreparing key="preparing" />}
          {step === 7 && <Dashboard key="dashboard" />}
          {step === 8 && <UploadDocuments key="upload" />}
          {step === 9 && <InviteColleagues key="invite" />}
          {step === 10 && <ConnectSources key="sources" />}
          {step === 11 && <ThemedDashboard key="themed-dashboard" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
