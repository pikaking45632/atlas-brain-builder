import { motion } from "framer-motion";

const totalSteps = 5;

interface StepProgressProps {
  current: number;
}

const StepProgress = ({ current }: StepProgressProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isComplete = current > stepNum;
        const isActive = current === stepNum;

        return (
          <motion.div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              isComplete
                ? "w-8 bg-foreground"
                : isActive
                ? "w-8 bg-foreground"
                : "w-4 bg-border"
            }`}
            layoutId={`step-dot-${i}`}
          />
        );
      })}
    </div>
  );
};

export default StepProgress;
