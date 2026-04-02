import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Database, Layers, LayoutDashboard, Check } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import { useOnboarding } from "@/store/onboarding";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  { icon: Brain, label: "Structuring your workplace model", duration: 1800 },
  { icon: Database, label: "Configuring knowledge modules", duration: 2000 },
  { icon: Layers, label: "Preparing your AI workspace", duration: 1600 },
  { icon: LayoutDashboard, label: "Finalising your dashboard", duration: 1400 },
];

const StepPreparing = () => {
  const { setStep } = useOnboarding();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= steps.length) {
      const t = setTimeout(() => setStep(8), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActiveIndex((i) => i + 1), steps[activeIndex].duration);
    return () => clearTimeout(t);
  }, [activeIndex, setStep]);

  const progress = Math.min((activeIndex / steps.length) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      <div className="space-y-14 text-center max-w-md w-full">
        <AtlasLogo size="large" />

        <div className="space-y-3">
          <h2 className="text-4xl sm:text-[44px] font-display font-bold text-foreground tracking-tight">
            Building your AI.
          </h2>
          <p className="text-muted-foreground text-[15px]">
            This will only take a moment.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-2 text-left">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, ease }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                  isActive ? "glass-card" : isDone ? "" : "opacity-25"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  isDone || isActive ? "" : "bg-muted/30"
                }`}
                  style={(isDone || isActive) ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                  )}
                </div>
                <span className={`text-[15px] font-medium ${isDone || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default StepPreparing;
