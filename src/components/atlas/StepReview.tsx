import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules } from "@/data/modules";
import StepProgress from "./StepProgress";
import AtlasLogo from "./AtlasLogo";

const StepReview = () => {
  const { companyName, industry, businessType, goals, selectedModules, setStep } = useOnboarding();
  const selectedList = modules.filter((m) => selectedModules.includes(m.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-8 py-5">
        <AtlasLogo />
        <StepProgress current={5} />
        <div className="w-16" />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-xl space-y-8"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
              Ready to build.
            </h2>
            <p className="text-muted-foreground text-[15px]">
              Here's a summary of your AI configuration.
            </p>
          </div>

          <div className="space-y-4">
            {/* Company card */}
            <div className="apple-card p-6 space-y-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Name</span>
                  <p className="text-foreground font-medium mt-0.5">{companyName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Industry</span>
                  <p className="text-foreground font-medium mt-0.5">{industry}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Type</span>
                  <p className="text-foreground font-medium mt-0.5">{businessType}</p>
                </div>
                {goals && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground text-xs">Goals</span>
                    <p className="text-foreground font-medium mt-0.5">{goals}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modules card */}
            <div className="apple-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Knowledge Modules</h3>
                <span className="text-xs font-medium text-foreground bg-muted px-2.5 py-1 rounded-full">{selectedList.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedList.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
                    >
                      <Icon className="w-3 h-3" />
                      {mod.title}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setStep(4)}
              className="apple-btn-secondary h-[48px] px-6 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => setStep(6)}
              className="apple-btn-primary h-[48px] px-10 text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Create my AI
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StepReview;
