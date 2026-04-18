import { motion } from "framer-motion";

const totalSteps = 5;

interface StepProgressProps {
  current: number;
}

const StepProgress = ({ current }: StepProgressProps) => {
  const clamped = Math.min(Math.max(current, 1), totalSteps);
  const pct = (clamped / totalSteps) * 100;
  const label = String(clamped).padStart(2, "0");
  const total = String(totalSteps).padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
        STEP <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground/50"> / {total}</span>
      </span>
      <div className="relative h-[2px] w-32 bg-border overflow-hidden rounded-full">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

export default StepProgress;
