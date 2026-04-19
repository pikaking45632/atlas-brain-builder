import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { businessTypes, type BusinessType } from "@/data/modules";
import StepShell from "./StepShell";
import MagneticButton from "./MagneticButton";
import DrawCheck from "./DrawCheck";

const ease = [0.16, 1, 0.3, 1] as const;

const StepWorkplace = () => {
  const { businessType, setField, setStep } = useOnboarding();

  return (
    <StepShell step={4}>
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 pt-12 lg:pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="max-w-[720px]"
        >
          <span className="eyebrow">04 / INDUSTRY</span>
          <h1 className="mt-4 text-[44px] sm:text-[52px] font-display font-bold text-foreground leading-[1.05] tracking-[-0.03em]">
            What kind of<br />workplace?
          </h1>
          <p className="mt-5 text-[16px] leading-[1.65] text-muted-foreground max-w-[480px]">
            We use this to recommend the right modules, agents, and document
            templates for your sector.
          </p>
        </motion.div>

        {/* Industry grid */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {businessTypes.map(({ label, icon: Icon, description }, i) => {
            const isSelected = businessType === label;
            return (
              <motion.button
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease }}
                onClick={() => setField("businessType", label as BusinessType)}
                className={`relative text-left p-5 rounded-[12px] border bg-card transition-all duration-200 group overflow-hidden ${
                  isSelected
                    ? "border-accent shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                    : "border-border hover:border-foreground/20 hover:-translate-y-[2px] hover:shadow-card-hover"
                }`}
              >
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, ease }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                  >
                    <DrawCheck size={11} colorClass="text-accent-foreground" stroke={2.5} />
                  </motion.span>
                )}
                <Icon
                  className={`w-[18px] h-[18px] mb-3 transition-colors ${
                    isSelected ? "text-accent" : "text-foreground/60 group-hover:text-foreground"
                  }`}
                  strokeWidth={1.5}
                />
                <h4 className="text-[14px] font-semibold text-foreground leading-tight">
                  {label}
                </h4>
                <p className="mt-1 text-[12px] leading-[1.45] text-muted-foreground">
                  {description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-12 flex items-center gap-3">
          <button
            onClick={() => setStep(3)}
            className="btn-ghost h-[48px] px-5 text-[14px] flex items-center gap-2"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <MagneticButton
            onClick={() => businessType && setStep(5)}
            disabled={!businessType}
            className="btn-primary h-[48px] px-7 flex items-center justify-center gap-2 group"
          >
            Continue
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </MagneticButton>
          <span className="hidden sm:inline ml-3 font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
            {businessType ? `SELECTED · ${businessType.toUpperCase()}` : "PICK ONE TO CONTINUE"}
          </span>
        </div>
      </div>
    </StepShell>
  );
};

export default StepWorkplace;
