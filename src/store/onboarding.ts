import { create } from "zustand";
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
  setStep: (step: number) => void;
  setField: (field: string, value: any) => void;
  toggleModule: (id: string) => void;
  setSelectedModules: (ids: string[]) => void;
}

export const useOnboarding = create<OnboardingState>((set) => ({
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
  setStep: (step) => set({ step }),
  setField: (field, value) => set({ [field]: value }),
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
}));
