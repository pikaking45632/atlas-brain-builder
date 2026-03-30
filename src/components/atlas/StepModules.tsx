import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Search } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules, categoryFilters, recommendations, type ModuleCategory } from "@/data/modules";
import ModuleCard from "./ModuleCard";
import StepProgress from "./StepProgress";
import AtlasLogo from "./AtlasLogo";

const ease = [0.16, 1, 0.3, 1] as const;

const StepModules = () => {
  const { businessType, selectedModules, toggleModule, setStep } = useOnboarding();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ModuleCategory | "All">("All");

  const recommended = businessType ? recommendations[businessType] || [] : [];

  const filtered = useMemo(() => {
    let list = modules;
    if (activeFilter !== "All") {
      list = list.filter((m) => m.category === activeFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.5, ease }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-8 py-6">
        <AtlasLogo />
        <StepProgress current={4} />
        <div className="w-16" />
      </header>

      <div className="flex-1 px-6 py-6 max-w-5xl mx-auto w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="text-center space-y-3"
        >
          <h2 className="text-4xl sm:text-[44px] font-display font-bold text-foreground tracking-tight">
            Design your model.
          </h2>
          <p className="text-muted-foreground text-[15px]">
            Choose the knowledge areas your AI should master.
          </p>
        </motion.div>

        {/* Counter pill */}
        <div className="flex justify-center">
          <div className="glass-card inline-flex items-center gap-3 px-5 py-2.5 text-sm">
            <span className="font-semibold text-foreground">
              {count} selected
            </span>
            <div className="w-px h-4 bg-border/40" />
            <span className="text-muted-foreground">
              {count < 8 ? `${8 - count} more needed` : "Ready to continue"}
            </span>
          </div>
        </div>

        {/* Search + filters */}
        <div className="space-y-4">
          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="cinematic-input h-[48px] pl-11 pr-4 rounded-full text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {(["All", ...categoryFilters] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeFilter === cat
                    ? "text-white shadow-[0_0_16px_-2px_hsl(var(--primary)/0.4)]"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                style={activeFilter === cat ? { background: "var(--gradient-primary)" } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
        <div className="flex gap-3 justify-center pt-4 pb-10">
          <button
            onClick={() => setStep(3)}
            className="btn-ghost h-[52px] px-6 text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => canContinue && setStep(5)}
            disabled={!canContinue}
            className="btn-primary h-[52px] px-10 text-sm flex items-center justify-center gap-2"
          >
            Review setup
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StepModules;
