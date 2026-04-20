// "Today" panel — the left 7-col area on the new dashboard. Hosts the
// hero prompt input (with @ summon) and an activity feed.
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Sparkles, ArrowUpRight } from "lucide-react";
import AgentMention, { findMention } from "@/components/office/AgentMention";
import { useOffice } from "@/store/office";
import { AGENTS_BY_ID } from "@/data/agents";

const ease = [0.16, 1, 0.3, 1] as const;

const TodayPanel = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);
  const { hired, setStatus } = useOffice();

  // Pre-fill from ?summon=<id>
  useEffect(() => {
    const summon = params.get("summon");
    if (!summon) return;
    const agent = AGENTS_BY_ID[summon as keyof typeof AGENTS_BY_ID];
    const h = useOffice.getState().getHired(agent?.id as any);
    if (!agent || !h) return;
    const label = h.customName ?? agent.defaultName;
    const v = `@${label.replace(/\s+/g, "")} `;
    setValue(v);
    setCaret(v.length);
    setTimeout(() => inputRef.current?.focus(), 50);
    setParams({});
  }, [params, setParams]);

  const handleChange = (newValue: string, newCaret: number) => {
    setValue(newValue);
    setCaret(newCaret);
  };

  const send = () => {
    if (!value.trim()) return;
    // Light up summoned agents in the office
    const matches = value.match(/@\w+/g) ?? [];
    matches.forEach((m) => {
      const name = m.slice(1).toLowerCase();
      const target = hired.find(
        (h) =>
          (h.customName ?? AGENTS_BY_ID[h.agentId].defaultName)
            .replace(/\s+/g, "")
            .toLowerCase() === name,
      );
      if (target) setStatus(target.agentId, "working", 8000);
    });
    // For now, summons just route the user into the chat surface (themed dashboard step 12).
    navigate("/chat");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="flex flex-col gap-5"
    >
      {/* Hero input */}
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
            ASK ATLAS
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
            TYPE @ TO SUMMON
          </span>
        </div>
        <div className="relative">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setCaret(e.target.selectionStart ?? e.target.value.length);
            }}
            onKeyUp={(e) => setCaret((e.target as HTMLInputElement).selectionStart ?? 0)}
            onClick={(e) => setCaret((e.target as HTMLInputElement).selectionStart ?? 0)}
            onKeyDown={(e) => {
              const m = findMention(value, caret);
              if (e.key === "Enter" && !m) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="What do you need? Summon an agent with @"
            className="cinematic-input h-[56px] text-[16px] pr-20"
          />
          <button
            onClick={send}
            disabled={!value.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md flex items-center justify-center bg-accent text-accent-foreground hover:bg-[hsl(224_76%_48%)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          <AgentMention
            value={value}
            caret={caret}
            anchorRef={inputRef as any}
            onSelect={(v, c) => handleChange(v, c)}
          />
        </div>
        {hired.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground mr-1">
              QUICK SUMMON
            </span>
            {hired.slice(0, 5).map((h) => {
              const a = AGENTS_BY_ID[h.agentId];
              const label = h.customName ?? a.defaultName;
              return (
                <button
                  key={h.id}
                  onClick={() => {
                    const v = `${value}${value && !value.endsWith(" ") ? " " : ""}@${label.replace(/\s+/g, "")} `;
                    setValue(v);
                    setCaret(v.length);
                    inputRef.current?.focus();
                  }}
                  className="inline-flex items-center gap-1.5 h-6 pl-0.5 pr-2 rounded-full border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${a.portrait})`, backgroundColor: `hsl(${a.accent} / 0.2)` }}
                  />
                  @{label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity feed */}
      <div className="rounded-[12px] border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
            TODAY · ACTIVITY
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground inline-flex items-center gap-2">
            <span className="pulse-dot pulse-dot--sm" />
            LIVE
          </span>
        </div>
        <ul className="divide-y divide-border">
          {hired.length === 0 ? (
            <li className="p-8 text-center">
              <p className="text-[13px] text-muted-foreground">
                No agents on the floor yet. Hire your first specialist to start seeing activity.
              </p>
              <button
                onClick={() => navigate("/hire")}
                className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-foreground text-background text-[13px] font-semibold hover:bg-foreground/90 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Browse the team
              </button>
            </li>
          ) : (
            hired.slice(0, 4).map((h, i) => {
              const a = AGENTS_BY_ID[h.agentId];
              const label = h.customName ?? a.defaultName;
              const samples = [
                `${label} drafted a follow-up email`,
                `${label} flagged 2 anomalies in this week's data`,
                `${label} reviewed an incoming contract`,
                `${label} updated the team roster`,
              ];
              return (
                <li key={h.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                  <span
                    className="w-7 h-7 rounded-md bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url(${a.portrait})`, backgroundColor: `hsl(${a.accent} / 0.15)` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-foreground truncate">{samples[i % samples.length]}</div>
                    <div className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                      {a.role} · {(i + 1) * 7} min ago
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                </li>
              );
            })
          )}
        </ul>
      </div>
    </motion.div>
  );
};

export default TodayPanel;
