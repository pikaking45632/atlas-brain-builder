import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

const CopyButton = ({ value, label = "Copy", className }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <button
      onClick={onCopy}
      className={cn(
        "relative inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card text-[12px] text-foreground hover:bg-muted transition-colors overflow-hidden",
        className
      )}
    >
      <Copy className="w-3 h-3" />
      <span>{label}</span>
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ x: 28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 28, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-2 inline-flex items-center gap-1 pl-2 bg-card text-success font-medium"
          >
            <Check className="w-3 h-3" />
            Copied
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default CopyButton;
