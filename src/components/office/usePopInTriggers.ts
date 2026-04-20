// Wires real route + URL signals to the pop-in queue. Throttling lives
// in the store so this hook is just a context detector. Add new
// triggers here as new product surfaces appear.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useOffice } from "@/store/office";
import { usePopIn } from "@/store/popin";
import { AGENTS } from "@/data/agents";

const POPIN_DELAY_MS = 8000; // wait this long after entering a context

export function usePopInTriggers() {
  const location = useLocation();
  const { hired } = useOffice();
  const enqueue = usePopIn((s) => s.enqueue);

  useEffect(() => {
    if (hired.length === 0) return;

    // Map the current route to a list of contexts we care about.
    let contexts: string[] = [];
    if (location.pathname === "/") contexts = ["dashboard"];
    if (location.pathname.startsWith("/office")) contexts = ["dashboard"];
    if (location.pathname.startsWith("/hire")) return; // never pop in on the Hire tab — distracting
    // Tag the doc context if a query param hints at it (used by callers / pop-in CTAs).
    const params = new URLSearchParams(location.search);
    const docKind = params.get("doc"); // e.g. ?doc=finance
    if (docKind) contexts.push(docKind);

    if (contexts.length === 0) return;

    const timer = window.setTimeout(() => {
      // Pick the first hired agent that has copy for one of the active contexts.
      for (const ctx of contexts) {
        const candidates = AGENTS.filter(
          (a) =>
            hired.some((h) => h.agentId === a.id) &&
            a.contexts.includes(ctx) &&
            a.popins[ctx],
        );
        if (candidates.length === 0) continue;
        // Round-robin by current minute so different agents get a turn.
        const pick = candidates[new Date().getMinutes() % candidates.length];
        enqueue(pick.id, ctx);
        break;
      }
    }, POPIN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, hired, enqueue]);
}
