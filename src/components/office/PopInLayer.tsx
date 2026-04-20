// Renders the proactive pop-in stack in the top-right of the viewport.
// Auto-dismisses after 20s. Honours prefers-reduced-motion.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { usePopIn } from "@/store/popin";
import { useOffice } from "@/store/office";
import { AGENTS_BY_ID } from "@/data/agents";

const ease = [0.16, 1, 0.3, 1] as const;
const AUTO_DISMISS_MS = 20_000;

const PopInLayer = () => {
  const navigate = useNavigate();
  const { queue, dismiss, accept } = usePopIn();

  // Auto-dismiss after AUTO_DISMISS_MS.
  useEffect(() => {
    if (queue.length === 0) return;
    const timers = queue.map((p) =>
      window.setTimeout(() => dismiss(p.id), AUTO_DISMISS_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [queue, dismiss]);

  return (
    <div
      className="fixed top-20 right-6 z-[60] flex flex-col gap-3 pointer-events-none"
      style={{ width: 360 }}
    >
      <AnimatePresence>
        {queue.map((p) => {
          const agent = AGENTS_BY_ID[p.agentId];
          const hired = useOffice.getState().getHired(p.agentId);
          const label = hired?.customName ?? agent.defaultName;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 40, y: -8 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [-4, 0],
              }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4, ease }}
              className="pointer-events-auto rounded-lg border border-border bg-card shadow-lg overflow-hidden relative"
            >
              {/* Tail pointing up-right, as if leaning in */}
              <div
                className="absolute -top-2 right-6 w-3 h-3 rotate-45 bg-card"
                style={{
                  borderTop: "1px solid hsl(var(--border))",
                  borderLeft: "1px solid hsl(var(--border))",
                }}
              />
              <div className="p-4 flex gap-3">
                <div
                  className="w-10 h-10 rounded-md shrink-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${agent.portrait})`,
                    backgroundColor: `hsl(${agent.accent} / 0.1)`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-[13px] font-semibold text-foreground truncate">
                      {label}
                    </div>
                    <button
                      onClick={() => dismiss(p.id, 30)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      aria-label="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground mb-2">
                    {agent.role}
                  </div>
                  <p className="text-[13px] text-foreground leading-[1.45]">
                    {p.message}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        accept(p.id);
                        navigate(`/?summon=${agent.id}`);
                      }}
                      className="h-7 px-3 rounded-md bg-accent text-accent-foreground text-[12px] font-medium hover:bg-[hsl(224_76%_48%)] transition-colors"
                    >
                      Yes, help
                    </button>
                    <button
                      onClick={() => dismiss(p.id, 30)}
                      className="h-7 px-3 rounded-md text-muted-foreground hover:text-foreground text-[12px] font-medium transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default PopInLayer;
