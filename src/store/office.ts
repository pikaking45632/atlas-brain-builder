// Office state — hired agents, customisations, desk layout, statuses,
// silence map. Backed by Supabase (RLS-protected) when the user is
// authenticated; falls back to in-memory only otherwise (so the UI is
// always demo-able).
import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { AGENTS, AGENTS_BY_ID, AgentId } from "@/data/agents";

export interface HiredAgent {
  id: string; // db row id (or local id)
  agentId: AgentId;
  customName: string | null;
  tone: number;
  detail: number;
  initiative: number;
  focusAreas: string[];
  deskColor: "oak" | "walnut" | "white" | "black";
  deskPlant: "monstera" | "snake" | "succulent" | "none";
  deskPoster: "none" | "city" | "mountains" | "abstract";
  deskLighting: "warm" | "cool" | "spotlight";
  gridX: number;
  gridY: number;
}

export type AgentStatus = "idle" | "thinking" | "working";

interface OfficeState {
  hired: HiredAgent[];
  loading: boolean;
  /** Map of agentId → live status. Lives in memory only. */
  statuses: Record<string, AgentStatus>;
  /** Map of agentId → unix ms. */
  silencedUntil: Record<string, number>;
  /** Selected agent id in the office view (if any). */
  selectedAgentId: AgentId | null;
  /** Hydrates from Supabase (no-op if not authed). */
  hydrate: () => Promise<void>;
  hire: (agentId: AgentId) => Promise<void>;
  fire: (agentId: AgentId) => Promise<void>;
  customise: (agentId: AgentId, patch: Partial<HiredAgent>) => Promise<void>;
  setStatus: (agentId: AgentId, status: AgentStatus, ttlMs?: number) => void;
  silence: (agentId: AgentId, minutes?: number) => void;
  isSilenced: (agentId: AgentId) => boolean;
  selectAgent: (agentId: AgentId | null) => void;
  isHired: (agentId: AgentId) => boolean;
  getHired: (agentId: AgentId) => HiredAgent | undefined;
}

const NEXT_FREE_GRID = (taken: HiredAgent[]): { x: number; y: number } => {
  const grid = new Set(taken.map((h) => `${h.gridX}:${h.gridY}`));
  for (const a of AGENTS) {
    const key = `${a.defaultGrid.x}:${a.defaultGrid.y}`;
    if (!grid.has(key)) return a.defaultGrid;
  }
  return { x: 0, y: 0 };
};

const DEFAULTS = (agentId: AgentId, taken: HiredAgent[]): Omit<HiredAgent, "id"> => {
  const seed = AGENTS_BY_ID[agentId];
  const slot = NEXT_FREE_GRID(taken);
  return {
    agentId,
    customName: null,
    tone: 50,
    detail: 50,
    initiative: 50,
    focusAreas: [],
    deskColor: "oak",
    deskPlant: "monstera",
    deskPoster: "none",
    deskLighting: "warm",
    gridX: seed?.defaultGrid.x ?? slot.x,
    gridY: seed?.defaultGrid.y ?? slot.y,
  };
};

const rowToHired = (row: any): HiredAgent => ({
  id: row.id,
  agentId: row.agent_id as AgentId,
  customName: row.custom_name,
  tone: row.tone,
  detail: row.detail,
  initiative: row.initiative,
  focusAreas: Array.isArray(row.focus_areas) ? row.focus_areas : [],
  deskColor: row.desk_color,
  deskPlant: row.desk_plant,
  deskPoster: row.desk_poster,
  deskLighting: row.desk_lighting,
  gridX: row.grid_x,
  gridY: row.grid_y,
});

export const useOffice = create<OfficeState>((set, get) => ({
  hired: [],
  loading: false,
  statuses: {},
  silencedUntil: {},
  selectedAgentId: null,

  hydrate: async () => {
    set({ loading: true });
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      set({ loading: false });
      return;
    }
    const [{ data: hiredRows }, { data: silencedRows }] = await Promise.all([
      supabase.from("hired_agents").select("*").order("hired_at", { ascending: true }),
      supabase
        .from("agent_silenced_until")
        .select("*")
        .gt("silenced_until", new Date().toISOString()),
    ]);
    const silencedUntil: Record<string, number> = {};
    silencedRows?.forEach((r: any) => {
      silencedUntil[r.agent_id] = new Date(r.silenced_until).getTime();
    });
    set({
      hired: (hiredRows ?? []).map(rowToHired),
      silencedUntil,
      loading: false,
    });
  },

  hire: async (agentId) => {
    if (get().isHired(agentId)) return;
    const taken = get().hired;
    const defaults = DEFAULTS(agentId, taken);
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user) {
      const { data, error } = await supabase
        .from("hired_agents")
        .insert({
          user_id: auth.user.id,
          agent_id: agentId,
          custom_name: defaults.customName,
          tone: defaults.tone,
          detail: defaults.detail,
          initiative: defaults.initiative,
          focus_areas: defaults.focusAreas,
          desk_color: defaults.deskColor,
          desk_plant: defaults.deskPlant,
          desk_poster: defaults.deskPoster,
          desk_lighting: defaults.deskLighting,
          grid_x: defaults.gridX,
          grid_y: defaults.gridY,
        })
        .select()
        .single();
      if (!error && data) {
        set({ hired: [...get().hired, rowToHired(data)] });
        return;
      }
    }
    // Local fallback
    set({
      hired: [
        ...get().hired,
        { id: `local:${agentId}`, ...defaults },
      ],
    });
  },

  fire: async (agentId) => {
    const target = get().hired.find((h) => h.agentId === agentId);
    if (!target) return;
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user && !target.id.startsWith("local:")) {
      await supabase.from("hired_agents").delete().eq("id", target.id);
    }
    set({ hired: get().hired.filter((h) => h.agentId !== agentId) });
  },

  customise: async (agentId, patch) => {
    const target = get().hired.find((h) => h.agentId === agentId);
    if (!target) return;
    const merged: HiredAgent = { ...target, ...patch };
    set({
      hired: get().hired.map((h) => (h.agentId === agentId ? merged : h)),
    });
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user && !target.id.startsWith("local:")) {
      await supabase
        .from("hired_agents")
        .update({
          custom_name: merged.customName,
          tone: merged.tone,
          detail: merged.detail,
          initiative: merged.initiative,
          focus_areas: merged.focusAreas,
          desk_color: merged.deskColor,
          desk_plant: merged.deskPlant,
          desk_poster: merged.deskPoster,
          desk_lighting: merged.deskLighting,
          grid_x: merged.gridX,
          grid_y: merged.gridY,
        })
        .eq("id", target.id);
    }
  },

  setStatus: (agentId, status, ttlMs = 6000) => {
    set({ statuses: { ...get().statuses, [agentId]: status } });
    if (status !== "idle") {
      window.setTimeout(() => {
        set({ statuses: { ...get().statuses, [agentId]: "idle" } });
      }, ttlMs);
    }
  },

  silence: (agentId, minutes = 30) => {
    const until = Date.now() + minutes * 60_000;
    set({ silencedUntil: { ...get().silencedUntil, [agentId]: until } });
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      supabase.from("agent_silenced_until").upsert(
        {
          user_id: data.user.id,
          agent_id: agentId,
          context: "global",
          silenced_until: new Date(until).toISOString(),
        },
        { onConflict: "user_id,agent_id,context" },
      );
    });
  },

  isSilenced: (agentId) => {
    const until = get().silencedUntil[agentId];
    return !!until && until > Date.now();
  },

  selectAgent: (agentId) => set({ selectedAgentId: agentId }),

  isHired: (agentId) => get().hired.some((h) => h.agentId === agentId),
  getHired: (agentId) => get().hired.find((h) => h.agentId === agentId),
}));
