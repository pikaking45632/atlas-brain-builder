import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, ArrowRight, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AGENTS, Agent } from "@/data/agents";
import { useOffice } from "@/store/office";
import CustomiseModal from "@/components/office/CustomiseModal";

const ease = [0.16, 1, 0.3, 1] as const;

const FILTERS = [
  { id: "all", label: "All roles" },
  { id: "FINANCE OPS", label: "Finance" },
  { id: "HR & PEOPLE", label: "People" },
  { id: "REVENUE OPS", label: "Sales" },
  { id: "MARKETING", label: "Marketing" },
  { id: "OPERATIONS", label: "Ops" },
  { id: "COMPLIANCE & LEGAL", label: "Legal" },
  { id: "IT & SECURITY", label: "IT" },
  { id: "KNOWLEDGE", label: "Knowledge" },
  { id: "CUSTOMER SUCCESS", label: "Success" },
  { id: "PROCUREMENT", label: "Procurement" },
];

const HirePage = () => {
  const navigate = useNavigate();
  const { hired, hire, isHired } = useOffice();
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "hired" | "available">("all");
  const [customising, setCustomising] = useState<Agent | null>(null);

  const visible = AGENTS.filter((a) => {
    if (filter !== "all" && a.role !== filter) return false;
    if (statusFilter === "hired" && !isHired(a.id)) return false;
    if (statusFilter === "available" && isHired(a.id)) return false;
    return true;
  });

  const handleHire = async (agent: Agent) => {
    await hire(agent.id);
    toast.success(`${agent.defaultName} has joined your office.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="min-h-screen bg-background"
    >
      <header className="border-b border-border bg-card">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[13px]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
            HIRE
          </span>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10">
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
            BUILD YOUR TEAM
          </span>
          <h1 className="mt-3 text-[44px] sm:text-[56px] font-display font-bold text-foreground leading-[1.02] tracking-[-0.04em]">
            Ten specialists.<br />Hire the ones you need.
          </h1>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-[520px]">
            One subscription. No per-seat fees. You've hired{" "}
            <span className="text-foreground font-semibold">{hired.length}</span> of {AGENTS.length} available.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-1 mr-3">
            {(["all", "available", "hired"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`h-7 px-3 rounded-md text-[12px] font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-border mr-2" />
          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`h-7 px-3 rounded-md text-[12px] font-medium transition-colors ${
                  filter === f.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {visible.map((agent, i) => {
              const _hired = isHired(agent.id);
              return (
                <motion.div
                  key={agent.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease }}
                  className="relative rounded-[12px] border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-200 group"
                >
                  {_hired && (
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 h-6 px-2.5 rounded-full font-mono text-[10px] tracking-[0.14em] bg-accent text-accent-foreground">
                      <Check className="w-3 h-3" />
                      HIRED
                    </span>
                  )}

                  <div
                    className="relative aspect-[4/3] flex items-center justify-center"
                    style={{
                      background: `linear-gradient(180deg, hsl(${agent.accent} / 0.1) 0%, hsl(${agent.accent} / 0.03) 100%)`,
                    }}
                  >
                    <img
                      src={agent.portrait}
                      alt={agent.defaultName}
                      className="w-[70%] h-[90%] object-contain object-bottom"
                      loading="lazy"
                      width={512}
                      height={512}
                    />
                  </div>

                  <div className="p-5">
                    <div className="font-mono text-[10px] tracking-[0.14em]" style={{ color: `hsl(${agent.accent})` }}>
                      {agent.role}
                    </div>
                    <h3 className="text-[20px] font-display font-semibold text-foreground mt-1">
                      {agent.defaultName}
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.5] text-muted-foreground line-clamp-3">
                      {agent.pitch}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border space-y-1">
                      {agent.stats.map((s) => (
                        <div key={s} className="text-[11.5px] text-muted-foreground flex items-start gap-1.5">
                          <span className="text-foreground/40 mt-0.5">·</span>
                          {s}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {agent.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center h-5 px-2 rounded-full text-[10.5px] font-medium border border-border bg-muted text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5">
                      {_hired ? (
                        <button
                          onClick={() => setCustomising(agent)}
                          className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-md border border-border text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          Customise
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHire(agent)}
                          className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground text-background text-[13px] font-semibold hover:bg-foreground/90 transition-colors"
                        >
                          Hire
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {customising && (
        <CustomiseModal
          agentId={customising.id}
          onClose={() => setCustomising(null)}
        />
      )}
    </motion.div>
  );
};

export default HirePage;
