import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DrawCheckProps {
  className?: string;
  /** size in px */
  size?: number;
  /** color via tailwind class (e.g. text-accent) */
  colorClass?: string;
  /** stroke-width */
  stroke?: number;
  /** delay before drawing in seconds */
  delay?: number;
  /** total draw duration in seconds */
  duration?: number;
}

/**
 * SVG check that draws itself in. Used to mark completed onboarding steps and
 * the final "Setup complete" moment.
 */
const DrawCheck = ({
  className,
  size = 14,
  colorClass = "text-accent",
  stroke = 2.25,
  delay = 0,
  duration = 0.3,
}: DrawCheckProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(colorClass, className)}
      aria-hidden
    >
      <motion.path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
};

export default DrawCheck;
