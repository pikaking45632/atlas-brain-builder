// Tiny store for the proactive pop-in queue. Throttling lives here so
// the rest of the UI just enqueues — the store decides what to show.
import { create } from "zustand";
import { AgentId, getAgent } from "@/data/agents";
import { useOffice } from "./office";

export interface PopIn {
  id: string;
  agentId: AgentId;
  context: string;
  message: string;
  createdAt: number;
}

interface PopInState {
  queue: PopIn[];
  /** Map of `${agentId}:${context}` → unix ms of last shown. */
  lastShown: Record<string, number>;
  enqueue: (agentId: AgentId, context: string, message?: string) => void;
  dismiss: (id: string, silenceMinutes?: number) => void;
  accept: (id: string) => void;
  clearAll: () => void;
}

const COOLDOWN_MS = 10 * 60_000; // 10 minutes per agent+context
const MAX_VISIBLE = 3;

export const usePopIn = create<PopInState>((set, get) => ({
  queue: [],
  lastShown: {},

  enqueue: (agentId, context, message) => {
    const office = useOffice.getState();
    if (!office.isHired(agentId)) return;
    if (office.isSilenced(agentId)) return;

    const key = `${agentId}:${context}`;
    const last = get().lastShown[key] ?? 0;
    if (Date.now() - last < COOLDOWN_MS) return;

    // Don't double-queue the same agent+context that's already showing.
    if (get().queue.some((p) => p.agentId === agentId && p.context === context)) return;

    const agent = getAgent(agentId);
    const text =
      message ?? agent?.popins[context] ?? "I think I can help with what you're doing.";

    const popin: PopIn = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      agentId,
      context,
      message: text,
      createdAt: Date.now(),
    };

    set({
      queue: [popin, ...get().queue].slice(0, MAX_VISIBLE),
      lastShown: { ...get().lastShown, [key]: Date.now() },
    });
  },

  dismiss: (id, silenceMinutes) => {
    const target = get().queue.find((p) => p.id === id);
    if (!target) return;
    if (silenceMinutes) useOffice.getState().silence(target.agentId, silenceMinutes);
    set({ queue: get().queue.filter((p) => p.id !== id) });
  },

  accept: (id) => {
    set({ queue: get().queue.filter((p) => p.id !== id) });
  },

  clearAll: () => set({ queue: [] }),
}));
