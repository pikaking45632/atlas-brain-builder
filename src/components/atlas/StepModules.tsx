import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Search } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules, categoryFilters, recommendations, type ModuleCategory } from "@/data/modules";
import ModuleCard from "./ModuleCard";
import StepShell from "./StepShell";
import MagneticButton from "./MagneticButton";

const ease = [0.16, 1, 0.3, 1] as const;

const StepModules = () => {
  const { businessType, selectedModules, toggleModule, setStep } = useOnboarding();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ModuleCategory | "All">("All");

  const recommended = businessType ? recommendations[businessType] || [] : [];

  const filtered = useMemo(() => {
    let list = modules;
    if (activeFilter !== "All") list = list.filter((m) => m.category === activeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      const aRec = recommended.includes(a.id) ? 0 : 1;
      const bRec = recommended.includes(b.id) ? 0 : 1;
      return aRec - bRec;
    });
  }, [activeFilter, search, recommended]);

  const count = selectedModules.length;
  const canContinue = count >= 8;
  const remaining = Math.max(0, 8 - count);

  return (
    <StepShell step={5}>
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 pt-12 lg:pt-16 pb-16">
        {/* Header band — editorial */}
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="lg:col-span-7"
          >
            <span className="eyebrow">05 / MODULES</span>
            <h1 className="mt-4 text-[44px] sm:text-[52px] font-display font-bold text-foreground leading-[1.05] tracking-[-0.03em]">
              Design your model.
            </h1>
            <p className="mt-5 text-[16px] leading-[1.65] text-muted-foreground max-w-[480px]">
              Pick at least eight knowledge areas. Atlas will spin up a
              specialist agent for each, and route questions automatically.
            </p>
          </motion.div>

          {/* Counter card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease }}
            className="lg:col-span-5"
          >
            <div className="rounded-[12px] border border-border bg-card p-5 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  Selected
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[40px] font-display font-bold text-foreground tracking-[-0.03em] tabular-nums leading-none">
                    {count}
                  </span>
                  <span className="font-mono text-[12px] text-muted-foreground">
                    / {modules.length}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  {canContinue ? "Status" : "Required"}
                </span>
                <p className={`mt-1 text-[14px] font-medium ${canContinue ? "text-success" : "text-foreground"}`}>
                  {canContinue ? "Ready to continue" : `${remaining} more needed`}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search + filters */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules…"
              className="cinematic-input h-[42px] pl-10 text-[14px]"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["All", ...categoryFilters] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`h-[32px] px-3 rounded-md text-[12px] font-medium transition-all ${
                  activeFilter === cat
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        >
          <AnimatePresence>
            {filtered.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                selected={selectedModules.includes(mod.id)}
                recommended={recommended.includes(mod.id)}
                onToggle={() => toggleModule(mod.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Actions */}
        <div className="mt-12 flex items-center gap-3">
          <button
            onClick={() => setStep(4)}
            className="btn-ghost h-[48px] px-5 text-[14px] flex items-center gap-2"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <MagneticButton
            onClick={() => canContinue && setStep(6)}
            disabled={!canContinue}
            className="btn-primary h-[48px] px-7 flex items-center justify-center gap-2 group"
          >
            Review setup
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </MagneticButton>
          <span className="hidden sm:inline ml-3 font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
            MIN 8 · MAX 20
          </span>
        </div>
      </div>
    </StepShell>
  );
};

export default StepModules;
