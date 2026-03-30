import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules } from "@/data/modules";
import StepProgress from "./StepProgress";
import AtlasLogo from "./AtlasLogo";

const ease = [0.16, 1, 0.3, 1] as const;

const StepReview = () => {
  const { companyName, industry, businessType, goals, selectedModules, setStep } = useOnboarding();
  const selectedList = modules.filter((m) => selectedModules.includes(m.id));

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.5, ease }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-8 py-6">
        <AtlasLogo />
        <StepProgress current={5} />
        <div className="w-16" />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="w-full max-w-xl space-y-10"
        >
          <div className="text-center space-y-3">
            <h2 className="text-4xl sm:text-[44px] font-display font-bold text-foreground tracking-tight">
              Ready to build.
            </h2>
            <p className="text-muted-foreground text-[15px]">
              Here's your AI configuration.
            </p>
          </div>

          <div className="space-y-4">
            {/* Company card */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Company</h3>
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
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Knowledge Modules</h3>
                <span className="text-xs font-semibold text-primary-foreground px-2.5 py-0.5 rounded-full"
                  style={{ background: "var(--gradient-primary)" }}
                >{selectedList.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedList.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-full text-xs font-medium text-foreground/80 border border-border/30"
                    >
                      <Icon className="w-3 h-3 text-primary" />
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
              className="btn-ghost h-[52px] px-6 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => setStep(6)}
              className="btn-primary h-[52px] px-10 text-sm flex items-center justify-center gap-2"
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
