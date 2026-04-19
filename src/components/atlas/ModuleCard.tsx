import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import type { Module } from "@/data/modules";

interface ModuleCardProps {
  module: Module;
  selected: boolean;
  recommended: boolean;
  onToggle: () => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

const ModuleCard = ({ module, selected, recommended, onToggle }: ModuleCardProps) => {
  const Icon = module.icon;

  return (
    <motion.button
      layout
      onClick={onToggle}
      transition={{ layout: { duration: 0.3, ease } }}
      className={`relative text-left p-4 rounded-[10px] border bg-card transition-all duration-200 group overflow-hidden ${
        selected
          ? "border-accent shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
          : "border-border hover:border-foreground/20 hover:-translate-y-[2px] hover:shadow-card-hover"
      }`}
    >
      {recommended && !selected && (
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 font-mono text-[9.5px] tracking-[0.08em] uppercase text-accent">
          <Star className="w-2.5 h-2.5 fill-accent" strokeWidth={0} />
          REC
        </span>
      )}

      {selected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease }}
          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center"
        >
          <Check className="w-2.5 h-2.5 text-accent-foreground" strokeWidth={3} />
        </motion.span>
      )}

      <Icon
        className={`w-[18px] h-[18px] mb-2.5 transition-colors ${
          selected ? "text-accent" : "text-foreground/55 group-hover:text-foreground"
        }`}
        strokeWidth={1.5}
      />
      <h4 className="text-[13px] font-semibold text-foreground leading-tight">
        {module.title}
      </h4>
      <p className="mt-1 text-[11.5px] leading-[1.45] text-muted-foreground line-clamp-2">
        {module.description}
      </p>
    </motion.button>
  );
};

export default ModuleCard;
