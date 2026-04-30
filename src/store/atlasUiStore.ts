import { create } from "zustand";

export type AtlasTab = "chat" | "knowledge" | "sources" | "team";

interface AtlasUiState {
  /** Tab currently active in the workspace dashboard. */
  activeTab: AtlasTab;
  setActiveTab: (tab: AtlasTab) => void;

  /**
   * A prompt queued to be sent into the chat. AtlasChat consumes this on
   * mount / when it changes, then calls clearPendingPrompt().
   */
  pendingPrompt: string | null;
  sendPrompt: (prompt: string) => void;
  clearPendingPrompt: () => void;
}

export const useAtlasUi = create<AtlasUiState>((set) => ({
  activeTab: "chat",
  setActiveTab: (tab) => set({ activeTab: tab }),

  pendingPrompt: null,
  sendPrompt: (prompt) =>
    set({ activeTab: "chat", pendingPrompt: prompt }),
  clearPendingPrompt: () => set({ pendingPrompt: null }),
}));
