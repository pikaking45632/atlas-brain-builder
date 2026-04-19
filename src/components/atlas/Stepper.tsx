import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import DrawCheck from "./DrawCheck";

const STEP_LABELS = [
  { id: 1, label: "Plan" },
  { id: 2, label: "Account" },
  { id: 3, label: "Company" },
  { id: 4, label: "Industry" },
  { id: 5, label: "Modules" },
  { id: 6, label: "Review" },
];

const ease = [0.16, 1, 0.3, 1] as const;

interface StepperProps {
  /** 1-based current step */
  current: number;
  total?: number;
  /** override labels if needed */
  labels?: { id: number; label: string }[];
}

/**
 * Editorial stepper — current step is bolder, completed steps draw a check,
 * future steps are muted, and the connecting line fills with accent as
 * progress advances. Whenever `current` increases, a thin accent line sweeps
 * left-to-right across the top of the viewport (400ms celebration).
 */
const Stepper = ({ current, total = 6, labels = STEP_LABELS }: StepperProps) => {
  const items = labels.slice(0, total);
  const clamped = Math.min(Math.max(current, 1), total);
  const pct = ((clamped - 1) / Math.max(total - 1, 1)) * 100;

  // Sweep on advance
  const prev = useRef(current);
  const [sweepKey, setSweepKey] = useState(0);
  useEffect(() => {
    if (current > prev.current) setSweepKey((k) => k + 1);
    prev.current = current;
  }, [current]);

  return (
    <>
      {/* Sweep line (mounted at top of viewport) */}
      <AnimatePresence>
        {sweepKey > 0 && (
          <motion.span
            key={sweepKey}
            className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[60] origin-left pointer-events-none"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.4, ease }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 select-none">
        <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground hidden sm:inline">
          STEP{" "}
          <span className="text-foreground">
            {String(clamped).padStart(2, "0")}
          </span>
          <span className="text-muted-foreground/50">
            {" "}/ {String(total).padStart(2, "0")}
          </span>
        </span>

        <div className="relative flex items-center">
          {/* Track */}
          <div className="absolute left-0 right-0 h-px bg-border top-1/2 -translate-y-1/2" />
          {/* Filled track */}
          <motion.div
            className="absolute left-0 h-px bg-accent top-1/2 -translate-y-1/2"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease }}
          />

          <div className="relative flex items-center gap-3 sm:gap-5">
            {items.map((s) => {
              const isDone = s.id < clamped;
              const isActive = s.id === clamped;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span
                    className={`relative flex items-center justify-center w-5 h-5 rounded-full transition-colors duration-300 ${
                      isDone
                        ? "bg-accent"
                        : isActive
                          ? "bg-card border border-accent"
                          : "bg-card border border-border"
                    }`}
                  >
                    {isDone && (
                      <DrawCheck size={11} colorClass="text-accent-foreground" stroke={2.5} />
                    )}
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </span>
                  <span
                    className={`hidden md:inline font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors duration-300 ${
                      isActive
                        ? "text-foreground font-semibold"
                        : isDone
                          ? "text-foreground/60"
                          : "text-muted-foreground/60"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Stepper;
