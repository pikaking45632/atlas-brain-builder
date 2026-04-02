import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { businessTypes, type BusinessType } from "@/data/modules";
import StepProgress from "./StepProgress";
import AtlasLogo from "./AtlasLogo";

const ease = [0.16, 1, 0.3, 1] as const;

const StepWorkplace = () => {
  const { businessType, setField, setStep } = useOnboarding();

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
        <StepProgress current={3} />
        <div className="w-16" />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="w-full max-w-3xl space-y-12"
        >
          <div className="text-center space-y-3">
            <h2 className="text-4xl sm:text-[44px] font-display font-bold text-foreground tracking-tight">
              What kind of workplace?
            </h2>
            <p className="text-muted-foreground text-[15px] max-w-md mx-auto">
              We'll recommend modules tailored to your industry.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {businessTypes.map(({ label, icon: Icon, description }, i) => {
              const isSelected = businessType === label;
              return (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setField("businessType", label as BusinessType)}
                  className={`relative text-left p-5 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
                      : "border-border/40 bg-card/50 hover:border-border/60 hover:bg-card/80"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                  <Icon className={`w-6 h-6 mb-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <h4 className={`text-sm font-semibold leading-tight ${isSelected ? "text-foreground" : "text-foreground/80"}`}>{label}</h4>
                  <p className="text-[11px] mt-1 leading-snug text-muted-foreground">{description}</p>
                </motion.button>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setStep(3)}
              className="btn-ghost h-[52px] px-6 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => businessType && setStep(5)}
              disabled={!businessType}
              className="btn-primary h-[52px] px-10 text-sm flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StepWorkplace;
