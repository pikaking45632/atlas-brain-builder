import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BusinessType } from "@/data/modules";

export interface OnboardingState {
  step: number;
  plan: string;
  email: string;
  password: string;
  companyName: string;
  industry: string;
  teamSize: string;
  country: string;
  role: string;
  goals: string;
  businessType: BusinessType | null;
  selectedModules: string[];
  /** Set true once the user has completed at least one upload. Used by the
      persistent activation banner in the working dashboard. */
  hasUploadedDocuments: boolean;
  /** Number of invites successfully sent. Used by the activation banner. */
  invitesSentCount: number;
  setStep: (step: number) => void;
  setField: (field: string, value: any) => void;
  toggleModule: (id: string) => void;
  setSelectedModules: (ids: string[]) => void;
  markUploaded: () => void;
  setInvitesSent: (n: number) => void;
  /** Reset everything — used on sign-out or "start over". */
  reset: () => void;
}

const initial: Omit<
  OnboardingState,
  | "setStep"
  | "setField"
  | "toggleModule"
  | "setSelectedModules"
  | "markUploaded"
  | "setInvitesSent"
  | "reset"
> = {
  step: 1,
  plan: "",
  email: "",
  password: "",
  companyName: "",
  industry: "",
  teamSize: "",
  country: "",
  role: "",
  goals: "",
  businessType: null,
  selectedModules: [],
  hasUploadedDocuments: false,
  invitesSentCount: 0,
};

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (step) => set({ step }),
      setField: (field, value) => set({ [field]: value } as Partial<OnboardingState>),
      toggleModule: (id) =>
        set((state) => {
          const isSelected = state.selectedModules.includes(id);
          if (isSelected) {
            return { selectedModules: state.selectedModules.filter((m) => m !== id) };
          }
          if (state.selectedModules.length >= 20) return state;
          return { selectedModules: [...state.selectedModules, id] };
        }),
      setSelectedModules: (ids) => set({ selectedModules: ids }),
      markUploaded: () => set({ hasUploadedDocuments: true }),
      setInvitesSent: (n) => set({ invitesSentCount: n }),
      reset: () => set({ ...initial }),
    }),
    {
      name: "atlas-onboarding-v1",
      storage: createJSONStorage(() => localStorage),
      // Don't persist the password (security hygiene) or transient flags
      // we want to recompute. Everything else survives refresh.
      partialize: (state) => ({
        step: state.step,
        plan: state.plan,
        email: state.email,
        companyName: state.companyName,
        industry: state.industry,
        teamSize: state.teamSize,
        country: state.country,
        role: state.role,
        goals: state.goals,
        businessType: state.businessType,
        selectedModules: state.selectedModules,
        hasUploadedDocuments: state.hasUploadedDocuments,
        invitesSentCount: state.invitesSentCount,
      }),
    },
  ),
);
