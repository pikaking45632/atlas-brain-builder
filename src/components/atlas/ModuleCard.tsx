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
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      layout
      className={`relative w-full text-left rounded-2xl p-4 border transition-all duration-300 cursor-pointer group ${
        selected
          ? "border-primary/50 bg-primary/10 shadow-[0_0_24px_-4px_hsl(var(--primary)/0.25)]"
          : "border-border/30 bg-card/50 hover:border-border/50 hover:bg-card/80"
      }`}
    >
      {recommended && !selected && (
        <div className="absolute -top-2 right-3 flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{ background: "var(--gradient-primary)", color: "white" }}
        >
          <Star className="w-2.5 h-2.5" />
          Recommended
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            selected
              ? "bg-primary/20"
              : "bg-muted/50 group-hover:bg-muted"
          }`}
        >
          <Icon className={`w-4 h-4 ${selected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold leading-tight ${selected ? "text-foreground" : "text-foreground/80"}`}>
            {module.title}
          </h4>
          <p className="text-xs mt-0.5 leading-snug text-muted-foreground">
            {module.description}
          </p>
        </div>

        <motion.div
          initial={false}
          animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default ModuleCard;
