import { create } from "zustand";

type RailState = {
  visible: boolean;
  totalQuestions: number;
  doneCount: number;
  set: (data: Partial<Pick<RailState, "visible" | "totalQuestions" | "doneCount">>) => void;
  clear: () => void;
};

export const useRailStore = create<RailState>((set) => ({
  visible: false,
  totalQuestions: 0,
  doneCount: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  clear: () => set({ visible: false, totalQuestions: 0, doneCount: 0 }),
}));
