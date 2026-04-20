// @ mention picker for the prompt input. Pure controlled component —
// the parent owns the input value and we just provide the dropdown
// when the caret is in an `@token` position.
import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOffice } from "@/store/office";
import { AGENTS_BY_ID, getAgent } from "@/data/agents";

const ease = [0.16, 1, 0.3, 1] as const;

interface Props {
  /** Current input string. */
  value: string;
  /** Caret position. */
  caret: number;
  /** Replace the active @token with `@AgentName ` and call onChange. */
  onSelect: (newValue: string, newCaret: number, agentId: string) => void;
  anchorRef: React.RefObject<HTMLElement>;
}

interface Match {
  start: number;
  end: number;
  query: string;
}

function findMention(value: string, caret: number): Match | null {
  // Walk left from caret to find an @ that isn't preceded by a word char.
  let i = caret - 1;
  while (i >= 0) {
    const ch = value[i];
    if (ch === "@") {
      const before = value[i - 1];
      if (i === 0 || /\s/.test(before)) {
        const query = value.slice(i + 1, caret);
        if (/^[\w-]*$/.test(query)) {
          return { start: i, end: caret, query };
        }
      }
      return null;
    }
    if (/\s/.test(ch)) return null;
    i--;
  }
  return null;
}

const AgentMention = ({ value, caret, onSelect, anchorRef }: Props) => {
  const { hired } = useOffice();
  const [active, setActive] = useState(0);
  const match = findMention(value, caret);

  const candidates = hired
    .map((h) => ({
      hired: h,
      agent: AGENTS_BY_ID[h.agentId],
      label: h.customName ?? AGENTS_BY_ID[h.agentId].defaultName,
    }))
    .filter(({ label, agent }) => {
      if (!match) return false;
      const q = match.query.toLowerCase();
      return (
        label.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q) ||
        agent.id.toLowerCase().includes(q)
      );
    });

  useEffect(() => setActive(0), [match?.query, candidates.length]);

  // Keyboard navigation hooks attached to the anchor input.
  useEffect(() => {
    const el = anchorRef.current;
    if (!el || !match || candidates.length === 0) return;

    const handler = (ev: Event) => {
      const e = ev as unknown as KeyboardEvent;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % candidates.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + candidates.length) % candidates.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        commit(active);
      } else if (e.key === "Escape") {
        e.preventDefault();
        // Re-emit current value so parent can clear the active state if needed.
        onSelect(value, caret, "");
      }
    };
    el.addEventListener("keydown", handler as any, { capture: true });
    return () => el.removeEventListener("keydown", handler as any, { capture: true } as any);
  }, [anchorRef, match, candidates, active, value, caret]);

  const commit = (idx: number) => {
    if (!match) return;
    const candidate = candidates[idx];
    if (!candidate) return;
    const replacement = `@${candidate.label.replace(/\s+/g, "")} `;
    const newValue = value.slice(0, match.start) + replacement + value.slice(match.end);
    const newCaret = match.start + replacement.length;
    onSelect(newValue, newCaret, candidate.agent.id);
  };

  return (
    <AnimatePresence>
      {match && candidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15, ease }}
          className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50"
        >
          <div className="rounded-lg border border-border bg-card shadow-lg overflow-hidden max-h-[320px] overflow-y-auto">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                SUMMON AGENT
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                ↑↓ NAV · ↵ SELECT
              </span>
            </div>
            {candidates.map((c, i) => (
              <button
                key={c.hired.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(i);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  i === active ? "bg-muted" : "hover:bg-muted/60"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-md bg-cover bg-center bg-no-repeat shrink-0"
                  style={{
                    backgroundImage: `url(${c.agent.portrait})`,
                    backgroundColor: `hsl(${c.agent.accent} / 0.1)`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">
                    {c.label}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                    {c.agent.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { AgentMention, findMention };
export default AgentMention;
