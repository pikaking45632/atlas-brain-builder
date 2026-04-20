import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Sun, Moon, ZoomIn, ZoomOut, Volume2, VolumeX, Settings2 } from "lucide-react";
import OfficeScene from "@/components/office/OfficeScene";
import { useOffice } from "@/store/office";
import { AGENTS_BY_ID, AgentId, getAgent } from "@/data/agents";
import AgentDetailRail from "@/components/office/AgentDetailRail";
import CustomiseModal from "@/components/office/CustomiseModal";

const ease = [0.16, 1, 0.3, 1] as const;

const OfficePage = () => {
  const navigate = useNavigate();
  const { hired, selectAgent, selectedAgentId } = useOffice();
  const [zoom, setZoom] = useState(1);
  const [time, setTime] = useState<"day" | "night">("day");
  const [muted, setMuted] = useState(true);
  const [customising, setCustomising] = useState<AgentId | null>(null);

  const sceneSize = Math.min(900, 600 * zoom);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="min-h-screen flex flex-col"
      style={{
        background:
          time === "day"
            ? "linear-gradient(180deg, hsl(220 30% 12%) 0%, hsl(215 60% 8%) 100%)"
            : "linear-gradient(180deg, hsl(245 35% 8%) 0%, hsl(245 50% 4%) 100%)",
      }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between h-14 px-6 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="flex items-center gap-3 text-white/80 text-[13px]">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <span className="text-white/30">›</span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-white/60">
            OFFICE
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTime(time === "day" ? "night" : "day")}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors text-[12px]"
          >
            {time === "day" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
            {time === "day" ? "Day" : "Night"}
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
            className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title={muted ? "Unmute office ambience" : "Mute office ambience"}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors text-[12px]">
            <Settings2 className="w-3.5 h-3.5" />
            Layout
          </button>
        </div>
      </header>

      {/* Scene + right rail */}
      <div className="flex-1 flex items-stretch overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <OfficeScene
            size={sceneSize}
            showLabels={false}
            onAgentClick={(id) => selectAgent(id)}
            onEmptyClick={() => navigate("/hire")}
          />
        </div>

        {selectedAgentId && (
          <AgentDetailRail
            agentId={selectedAgentId}
            onClose={() => selectAgent(null)}
            onCustomise={() => setCustomising(selectedAgentId)}
            onSummon={() => {
              navigate(`/?summon=${selectedAgentId}`);
            }}
          />
        )}
      </div>

      {/* Bottom roster strip */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur p-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-[1200px] mx-auto">
          <span className="font-mono text-[10px] tracking-[0.14em] text-white/50 mr-2 shrink-0">
            ROSTER · {hired.length}/10
          </span>
          {hired.map((h) => {
            const agent = AGENTS_BY_ID[h.agentId];
            const active = selectedAgentId === h.agentId;
            return (
              <button
                key={h.id}
                onClick={() => selectAgent(h.agentId)}
                className={`shrink-0 inline-flex items-center gap-2 h-8 pl-1 pr-3 rounded-full transition-all ${
                  active
                    ? "bg-white text-foreground"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${agent.portrait})`,
                    backgroundColor: `hsl(${agent.accent} / 0.2)`,
                  }}
                />
                <span className="text-[12px] font-medium">
                  {h.customName ?? agent.defaultName}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => navigate("/hire")}
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-dashed border-white/30 text-white/70 hover:text-white hover:border-white/60 text-[12px] font-medium transition-all"
          >
            <Plus className="w-3 h-3" />
            Hire
          </button>
        </div>
      </footer>

      {customising && (
        <CustomiseModal
          agentId={customising}
          onClose={() => setCustomising(null)}
        />
      )}
    </motion.div>
  );
};

export default OfficePage;
