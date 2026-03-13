import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Search } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules, categoryFilters, recommendations, type ModuleCategory } from "@/data/modules";
import ModuleCard from "./ModuleCard";
import StepProgress from "./StepProgress";
import AtlasLogo from "./AtlasLogo";

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
    // Sort recommended first
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
        <StepProgress current={4} />
        <div className="w-20" />
      </header>

      <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full space-y-5">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold text-foreground">Design your model</h2>
          <p className="text-sm text-muted-foreground">
            Choose the knowledge areas your AI should understand from day one.
          </p>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-center">
          <div className="bg-card border border-border rounded-full px-5 py-2 text-sm font-medium">
            <span className={count >= 8 ? "text-primary" : "text-foreground"}>
              Selected {count}
            </span>
            <span className="text-muted-foreground"> of 20</span>
            {count < 8 && (
              <span className="text-muted-foreground ml-2">· {8 - count} more needed</span>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {(["All", ...categoryFilters] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
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
        <div className="flex gap-3 justify-center pt-4 pb-8">
          <button
            onClick={() => setStep(3)}
            className="h-11 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => canContinue && setStep(5)}
            disabled={!canContinue}
            className="h-11 px-8 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:brightness-110"
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
