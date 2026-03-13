import { motion } from "framer-motion";
import { Check } from "lucide-react";

const steps = [
  "Sign Up",
  "Company",
  "Workplace",
  "Modules",
  "Review",
];

interface StepProgressProps {
  current: number;
}

const StepProgress = ({ current }: StepProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 px-4">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isComplete = current > stepNum;
        const isActive = current === stepNum;

        return (
          <div key={label} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <motion.div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isComplete
                    ? "bg-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary text-primary-foreground glow-border"
                    : "bg-secondary text-muted-foreground"
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isComplete ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </motion.div>
              <span
                className={`hidden sm:block text-xs font-medium ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-px ${
                  isComplete ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepProgress;
