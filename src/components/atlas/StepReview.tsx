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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
        <StepProgress current={5} />
        <div className="w-20" />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground">Review your AI setup</h2>
            <p className="text-sm text-muted-foreground">Everything looks good? Let's build your model.</p>
          </div>

          <div className="space-y-4">
            {/* Company Info */}
            <div className="rounded-xl bg-card border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Company details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Company</span>
                  <p className="text-foreground font-medium">{companyName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Industry</span>
                  <p className="text-foreground font-medium">{industry}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Workplace type</span>
                  <p className="text-foreground font-medium">{businessType}</p>
                </div>
                {goals && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground text-xs">Goals</span>
                    <p className="text-foreground font-medium">{goals}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modules */}
            <div className="rounded-xl bg-card border border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Your AI will be configured to support these areas</h3>
                <span className="text-xs text-muted-foreground">{selectedList.length} modules</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedList.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg text-xs font-medium text-foreground"
                    >
                      <Icon className="w-3 h-3 text-primary" />
                      {mod.title}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep(4)}
              className="h-11 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => setStep(6)}
              className="h-11 px-8 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-primary text-primary-foreground hover:brightness-110"
            >
              <Sparkles className="w-4 h-4" />
              Create my AI
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepReview;
