import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Database, Layers, LayoutDashboard, Check } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import { useOnboarding } from "@/store/onboarding";

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
      const t = setTimeout(() => setStep(7), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActiveIndex((i) => i + 1), steps[activeIndex].duration);
    return () => clearTimeout(t);
  }, [activeIndex, setStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-4"
    >
      <div className="space-y-10 text-center max-w-md">
        <AtlasLogo size="large" />

        <div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Building your AI</h2>
          <p className="text-sm text-muted-foreground">This will only take a moment.</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(((activeIndex) / steps.length) * 100, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-3 text-left">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isActive ? "bg-card border border-primary/30" : isDone ? "bg-card/50" : "opacity-40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDone ? "bg-primary/20" : isActive ? "bg-primary" : "bg-secondary"
                }`}>
                  {isDone ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${isDone || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
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
