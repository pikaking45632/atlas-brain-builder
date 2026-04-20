import { motion } from "framer-motion";
import { X, Wand2, Sparkles, ChevronRight } from "lucide-react";
import { AgentId, AGENTS_BY_ID } from "@/data/agents";
import { useOffice } from "@/store/office";

const ease = [0.16, 1, 0.3, 1] as const;

interface Props {
  agentId: AgentId;
  onClose: () => void;
  onCustomise: () => void;
  onSummon: () => void;
}

const AgentDetailRail = ({ agentId, onClose, onCustomise, onSummon }: Props) => {
  const agent = AGENTS_BY_ID[agentId];
  const hired = useOffice((s) => s.getHired(agentId));
  const status = useOffice((s) => s.statuses[agentId] ?? "idle");

  if (!agent) return null;

  const statusLabel: Record<string, string> = {
    idle: "Available",
    thinking: "Thinking",
    working: "Working",
  };

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="w-[340px] border-l border-white/10 bg-black/40 backdrop-blur-xl text-white flex flex-col shrink-0"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <span className="font-mono text-[10px] tracking-[0.14em] text-white/60">
          AGENT DETAIL
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 border-b border-white/10">
          <div
            className="w-full aspect-square rounded-lg bg-cover bg-center bg-no-repeat mb-4"
            style={{
              backgroundImage: `url(${agent.portrait})`,
              backgroundColor: `hsl(${agent.accent} / 0.15)`,
            }}
          />
          <div className="font-mono text-[10px] tracking-[0.14em]" style={{ color: `hsl(${agent.accent})` }}>
            {agent.role}
          </div>
          <h3 className="text-[22px] font-display font-semibold mt-1">
            {hired?.customName ?? agent.defaultName}
          </h3>
          <div className="mt-3 inline-flex items-center gap-2 text-[12px] text-white/70">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background:
                  status === "idle"
                    ? "hsl(142 71% 45%)"
                    : status === "thinking"
                    ? "hsl(38 92% 55%)"
                    : "hsl(221 83% 53%)",
              }}
            />
            {statusLabel[status]}
          </div>
        </div>

        <div className="p-5 border-b border-white/10">
          <span className="font-mono text-[10px] tracking-[0.14em] text-white/60 mb-2 block">
            ABOUT
          </span>
          <p className="text-[13.5px] leading-[1.55] text-white/85">{agent.pitch}</p>
        </div>

        <div className="p-5 border-b border-white/10">
          <span className="font-mono text-[10px] tracking-[0.14em] text-white/60 mb-3 block">
            STATS
          </span>
          <div className="space-y-1.5">
            {agent.stats.map((s) => (
              <div key={s} className="text-[12.5px] text-white/80 flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-1 shrink-0" style={{ color: `hsl(${agent.accent})` }} />
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <span className="font-mono text-[10px] tracking-[0.14em] text-white/60 mb-3 block">
            SPECIALISMS
          </span>
          <div className="flex flex-wrap gap-1.5">
            {agent.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium border"
                style={{
                  borderColor: `hsl(${agent.accent} / 0.4)`,
                  background: `hsl(${agent.accent} / 0.1)`,
                  color: "white",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 flex items-center gap-2">
        <button
          onClick={onSummon}
          className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-md bg-white text-foreground text-[13px] font-semibold hover:bg-white/90 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Summon
        </button>
        <button
          onClick={onCustomise}
          className="h-10 inline-flex items-center justify-center gap-2 px-4 rounded-md border border-white/20 text-white text-[13px] font-medium hover:bg-white/10 transition-colors"
        >
          <Wand2 className="w-3.5 h-3.5" />
          Customise
        </button>
      </div>
    </motion.aside>
  );
};

export default AgentDetailRail;
