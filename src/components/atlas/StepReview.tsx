import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules } from "@/data/modules";
import StepShell from "./StepShell";
import MagneticButton from "./MagneticButton";

const ease = [0.16, 1, 0.3, 1] as const;

const StepReview = () => {
  const { companyName, industry, businessType, goals, selectedModules, plan, setStep } = useOnboarding();
  const selectedList = modules.filter((m) => selectedModules.includes(m.id));

  const planLabel: Record<string, string> = { startup: "Startup · £9.99/mo", sme: "SME · £29.99/mo", enterprise: "Enterprise" };

  const summaryRows: { label: string; value: string }[] = [
    { label: "Plan", value: planLabel[plan] || "—" },
    { label: "Company", value: companyName || "—" },
    { label: "Industry", value: industry || "—" },
    { label: "Workplace", value: businessType || "—" },
    { label: "Modules", value: `${selectedList.length} configured` },
  ];

  return (
    <StepShell step={6}>
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 pt-12 lg:pt-20 pb-16 grid lg:grid-cols-12 gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="lg:col-span-5"
        >
          <span className="eyebrow">06 / REVIEW</span>
          <h1 className="mt-4 text-[44px] sm:text-[52px] font-display font-bold text-foreground leading-[1.05] tracking-[-0.03em]">
            Ready to build.
          </h1>
          <p className="mt-5 text-[16px] leading-[1.65] text-muted-foreground max-w-[420px]">
            One last look. We'll provision your workspace, load your modules
            and spin up the specialist agents — in about ten seconds.
          </p>

          {goals && (
            <div className="mt-8 rounded-[12px] border border-border bg-muted/30 p-4">
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                Stated goal
              </span>
              <p className="mt-1.5 text-[13.5px] text-foreground italic leading-[1.55]">
                "{goals}"
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Summary list */}
          <div className="rounded-[12px] border border-border bg-card overflow-hidden">
            {summaryRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[140px_1fr] items-center px-5 py-4 ${
                  i !== summaryRows.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  {row.label}
                </span>
                <span className="text-[14px] text-foreground font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Modules grid */}
          <div className="rounded-[12px] border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                Knowledge modules
              </span>
              <span className="font-mono text-[11px] tracking-[0.14em] text-foreground">
                {selectedList.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedList.map((mod) => {
                const Icon = mod.icon;
                return (
                  <span
                    key={mod.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background text-[12px] text-foreground"
                  >
                    <Icon className="w-3 h-3 text-accent" strokeWidth={1.75} />
                    {mod.title}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setStep(5)}
              className="btn-ghost h-[48px] px-5 text-[14px] flex items-center gap-2"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <MagneticButton
              onClick={() => setStep(7)}
              className="btn-primary flex-1 h-[48px] flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4" />
              Build my AI
            </MagneticButton>
          </div>
          <p className="text-[12px] text-muted-foreground">
            You can change any of this later from settings.
          </p>
        </motion.div>
      </div>
    </StepShell>
  );
};

export default StepReview;
