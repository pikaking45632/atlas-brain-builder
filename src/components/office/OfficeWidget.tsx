import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OfficeScene from "./OfficeScene";
import { useOffice } from "@/store/office";
import { AgentId, AGENTS } from "@/data/agents";

const ease = [0.16, 1, 0.3, 1] as const;

const OfficeWidget = () => {
  const navigate = useNavigate();
  const { hired } = useOffice();
  const total = AGENTS.length;

  const handleAgent = (agentId: AgentId) => {
    useOffice.getState().selectAgent(agentId);
    navigate("/office");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="relative rounded-[12px] border border-border bg-card overflow-hidden"
      style={{ minHeight: 380 }}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
            YOUR OFFICE
          </span>
          <div className="text-[14px] font-semibold text-foreground mt-0.5">
            {hired.length} of {total} desks filled
          </div>
        </div>
        <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground inline-flex items-center gap-2">
          <span className="pulse-dot pulse-dot--sm" />
          LIVE
        </span>
      </div>

      {/* Scene */}
      <div
        className="relative"
        style={{
          background:
            "radial-gradient(ellipse at top, hsl(220 30% 99%) 0%, hsl(220 20% 96%) 100%)",
        }}
      >
        <OfficeScene
          size={460}
          compact
          onAgentClick={handleAgent}
          onEmptyClick={() => navigate("/hire")}
          onExpand={() => navigate("/office")}
        />
      </div>
    </motion.div>
  );
};

export default OfficeWidget;
