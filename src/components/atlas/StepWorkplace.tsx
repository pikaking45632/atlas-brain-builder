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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-8 py-5">
        <AtlasLogo />
        <StepProgress current={3} />
        <div className="w-16" />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-3xl space-y-10"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
              What kind of workplace?
            </h2>
            <p className="text-muted-foreground text-[15px] max-w-md mx-auto">
              We'll recommend modules tailored to your industry.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {businessTypes.map(({ label, icon: Icon, description }) => {
              const isSelected = businessType === label;
              return (
                <motion.button
                  key={label}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setField("businessType", label as BusinessType)}
                  className={`relative text-left p-5 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? "bg-foreground text-background border-foreground shadow-lg"
                      : "bg-card border-border hover:border-foreground/20 hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-background flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-foreground" />
                    </motion.div>
                  )}
                  <Icon className={`w-6 h-6 mb-3 ${isSelected ? "text-background" : "text-foreground"}`} />
                  <h4 className={`text-sm font-semibold leading-tight ${isSelected ? "text-background" : "text-foreground"}`}>{label}</h4>
                  <p className={`text-[11px] mt-1 leading-snug ${isSelected ? "text-background/60" : "text-muted-foreground"}`}>{description}</p>
                </motion.button>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setStep(2)}
              className="apple-btn-secondary h-[48px] px-6 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => businessType && setStep(4)}
              disabled={!businessType}
              className="apple-btn-primary h-[48px] px-10 text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
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
