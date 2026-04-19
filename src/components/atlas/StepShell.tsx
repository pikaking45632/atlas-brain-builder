import { ReactNode } from "react";
import { motion } from "framer-motion";
import AtlasLogo from "./AtlasLogo";
import Stepper from "./Stepper";

interface StepShellProps {
  /** 1-based current step (within the 6-step setup flow) */
  step: number;
  /** total visible setup steps */
  totalSteps?: number;
  /** content of the step */
  children: ReactNode;
  /** optional right-aligned slot in the header (e.g. Sign in link) */
  headerRight?: ReactNode;
  /** make the page content full-bleed (no max-width) */
  fullBleed?: boolean;
  /** className for content wrapper */
  contentClassName?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Shared full-page shell for setup steps. Provides a consistent header with
 * the Atlas mark + animated stepper, generous vertical space, and a fade-in
 * animation on the content.
 */
const StepShell = ({
  step,
  totalSteps = 6,
  children,
  headerRight,
  fullBleed = false,
  contentClassName = "",
}: StepShellProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border bg-background sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <AtlasLogo />
        </div>
        <div className="hidden md:block">
          <Stepper current={step} total={totalSteps} />
        </div>
        <div className="flex items-center gap-4 min-w-[120px] justify-end">
          {headerRight}
        </div>
      </header>

      {/* Mobile stepper */}
      <div className="md:hidden border-b border-border px-6 py-3">
        <Stepper current={step} total={totalSteps} />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.05 }}
        className={`flex-1 flex flex-col ${fullBleed ? "" : ""} ${contentClassName}`}
      >
        {children}
      </motion.main>
    </motion.div>
  );
};

export default StepShell;
