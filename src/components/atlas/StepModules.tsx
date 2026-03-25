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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-8 py-5">
        <AtlasLogo />
        <StepProgress current={4} />
        <div className="w-16" />
      </header>

      <div className="flex-1 px-6 py-6 max-w-5xl mx-auto w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Design your model.
          </h2>
          <p className="text-muted-foreground text-[15px]">
            Choose the knowledge areas your AI should master.
          </p>
        </motion.div>

        {/* Counter pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 bg-muted/60 rounded-full px-5 py-2.5 text-sm">
            <span className={`font-semibold ${count >= 8 ? "text-foreground" : "text-foreground"}`}>
              {count} selected
            </span>
            <div className="w-px h-4 bg-border" />
            <span className="text-muted-foreground">
              {count < 8 ? `${8 - count} more needed` : "Ready to continue"}
            </span>
          </div>
        </div>

        {/* Search + filters */}
        <div className="space-y-3">
          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="apple-input h-[44px] pl-11 pr-4 rounded-full text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {(["All", ...categoryFilters] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === cat
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
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
        <div className="flex gap-3 justify-center pt-4 pb-10">
          <button
            onClick={() => setStep(3)}
            className="apple-btn-secondary h-[48px] px-6 text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => canContinue && setStep(5)}
            disabled={!canContinue}
            className="apple-btn-primary h-[48px] px-10 text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
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
