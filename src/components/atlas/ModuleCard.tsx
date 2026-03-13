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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      layout
      className={`relative w-full text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer group ${
        selected
          ? "bg-primary/10 border-primary/50 glow-border"
          : "bg-card border-border hover:border-primary/30 hover:bg-card-hover"
      }`}
    >
      {recommended && !selected && (
        <div className="absolute -top-2 right-3 flex items-center gap-1 bg-primary/20 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/30">
          <Star className="w-2.5 h-2.5" />
          Recommended
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground group-hover:text-foreground"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground leading-tight">
            {module.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {module.description}
          </p>
        </div>

        <motion.div
          initial={false}
          animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
        >
          <Check className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default ModuleCard;
