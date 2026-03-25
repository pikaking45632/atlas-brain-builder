import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import type { Module } from "@/data/modules";

interface ModuleCardProps {
  module: Module;
  selected: boolean;
  recommended: boolean;
  onToggle: () => void;
}

const ModuleCard = ({ module, selected, recommended, onToggle }: ModuleCardProps) => {
  const Icon = module.icon;

  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      layout
      className={`relative w-full text-left rounded-2xl p-4 border transition-all duration-300 cursor-pointer group ${
        selected
          ? "bg-foreground text-background border-foreground shadow-md"
          : "bg-card border-border hover:border-foreground/20 hover:shadow-md"
      }`}
    >
      {recommended && !selected && (
        <div className="absolute -top-2 right-3 flex items-center gap-1 bg-foreground text-background text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
          <Star className="w-2.5 h-2.5" />
          Recommended
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            selected
              ? "bg-background/15"
              : "bg-muted group-hover:bg-foreground/5"
          }`}
        >
          <Icon className={`w-4 h-4 ${selected ? "text-background" : "text-foreground"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold leading-tight ${selected ? "text-background" : "text-foreground"}`}>
            {module.title}
          </h4>
          <p className={`text-xs mt-0.5 leading-snug ${selected ? "text-background/60" : "text-muted-foreground"}`}>
            {module.description}
          </p>
        </div>

        <motion.div
          initial={false}
          animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          className="w-5 h-5 rounded-full bg-background flex items-center justify-center flex-shrink-0"
        >
          <Check className="w-3 h-3 text-foreground" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default ModuleCard;
