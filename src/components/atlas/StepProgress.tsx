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
            className="relative h-1 rounded-full overflow-hidden"
            animate={{
              width: isComplete || isActive ? 32 : 16,
            }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="absolute inset-0 bg-muted/40 rounded-full" />
            {(isComplete || isActive) && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--gradient-primary)" }}
                initial={{ scaleX: 0, transformOrigin: "left" }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default StepProgress;
