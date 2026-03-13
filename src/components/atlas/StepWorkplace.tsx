import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { businessTypes, type BusinessType } from "@/data/modules";
import StepProgress from "./StepProgress";
import AtlasLogo from "./AtlasLogo";

const StepWorkplace = () => {
  const { businessType, setField, setStep } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
        <StepProgress current={3} />
        <div className="w-20" />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground">Choose your workplace type</h2>
            <p className="text-sm text-muted-foreground">This helps us recommend the right knowledge modules for your AI.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {businessTypes.map(({ label, icon: Icon, description }) => {
              const isSelected = businessType === label;
              return (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setField("businessType", label as BusinessType)}
                  className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 border-primary/50 glow-border"
                      : "bg-card border-border hover:border-primary/30 hover:bg-card-hover"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <h4 className="text-sm font-semibold text-foreground">{label}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
                </motion.button>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep(2)}
              className="h-11 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => businessType && setStep(4)}
              disabled={!businessType}
              className="h-11 px-8 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:brightness-110"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepWorkplace;
