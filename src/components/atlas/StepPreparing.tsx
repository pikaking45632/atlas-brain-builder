import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Database, Layers, LayoutDashboard } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import DrawCheck from "./DrawCheck";
import { useOnboarding } from "@/store/onboarding";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  { icon: Brain,           label: "Structuring your workplace model",   duration: 1800 },
  { icon: Database,        label: "Configuring knowledge modules",      duration: 2000 },
  { icon: Layers,          label: "Spinning up specialist agents",      duration: 1600 },
  { icon: LayoutDashboard, label: "Finalising your workspace",          duration: 1400 },
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
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center px-6 md:px-10 h-16 border-b border-border">
        <AtlasLogo />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[520px] space-y-10">
          <div className="space-y-3">
            <span className="eyebrow inline-flex items-center gap-2">
              <span className="pulse-dot pulse-dot--sm" />
              PROVISIONING
            </span>
            <h1 className="text-[40px] font-display font-bold text-foreground tracking-[-0.03em] leading-[1.08]">
              Building your<br />workspace.
            </h1>
            <p className="text-[15px] text-muted-foreground">
              This will only take a moment.
            </p>
          </div>

          {/* Track */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">
              <span>Progress</span>
              <span className="text-foreground tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-[2px] bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease }}
              />
            </div>
          </div>

          <div className="rounded-[12px] border border-border bg-card overflow-hidden">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isDone = i < activeIndex;
              const isActive = i === activeIndex;
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors duration-300 ${
                    i !== steps.length - 1 ? "border-b border-border" : ""
                  } ${isActive ? "bg-accent/[0.04]" : ""}`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isDone
                        ? "bg-accent"
                        : isActive
                          ? "bg-card border border-accent"
                          : "bg-card border border-border"
                    }`}
                  >
                    {isDone ? (
                      <DrawCheck size={13} colorClass="text-accent-foreground" stroke={2.5} />
                    ) : isActive ? (
                      <span className="typing-dots">
                        <span /><span /><span />
                      </span>
                    ) : (
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </span>
                  <span
                    className={`text-[14px] transition-colors duration-300 ${
                      isDone || isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                      RUNNING
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepPreparing;
