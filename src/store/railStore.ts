import { create } from "zustand";

export type RailQuestion = {
  id: number;
  status: "pending" | "current" | "completed";
};

const buildQuestions = (completedCount: number): RailQuestion[] =>
  Array.from({ length: Math.max(6, completedCount + 1) }, (_, i) => ({
    id: i + 1,
    status: i < completedCount ? "completed" : i === completedCount ? "current" : "pending"
  }));

type RailState = {
  visible: boolean;
  totalQuestions: number;
  doneCount: number;
  questions: RailQuestion[];
  set: (data: Partial<Pick<RailState, "visible" | "totalQuestions" | "doneCount">>) => void;
  setQuestionState: (visibleCount: number, completedCount: number, totalQuestions?: number) => void;
  addPendingQuestion: () => void;
  completeNextPendingQuestion: () => void;
  addQuestion: () => void;
  clear: () => void;
};

export const useRailStore = create<RailState>((set) => ({
  visible: false,
  totalQuestions: 0,
  doneCount: 0,
  questions: [],
  set: (data) =>
    set((s) => {
      const next = { ...s, ...data };
      if (data.doneCount !== undefined || data.totalQuestions !== undefined) {
        next.questions = buildQuestions(next.doneCount);
      }
      return next;
    }),
  setQuestionState: (visibleCount, completedCount, totalQuestions) =>
    set((state) => ({
      ...state,
      totalQuestions: totalQuestions ?? state.totalQuestions,
      doneCount: completedCount,
      questions: buildQuestions(completedCount)
    })),
  addPendingQuestion: () =>
    set((state) => ({
      ...state,
      questions: [...state.questions, { id: state.questions.length + 1, status: "pending" }]
    })),
  completeNextPendingQuestion: () =>
    set((state) => {
      let completed = false;
      const questions = state.questions.map((question) => {
        if (completed || question.status === "completed") return question;
        completed = true;
        return { ...question, status: "completed" as const };
      });
      return {
        ...state,
        doneCount: questions.filter((q) => q.status === "completed").length,
        questions
      };
    }),
  addQuestion: () =>
    set((state) => {
      const questions = state.questions.map((q) =>
        q.status === "current" ? { ...q, status: "completed" as const } : q
      );
      const newId = questions.length + 1;
      return {
        ...state,
        doneCount: state.doneCount + 1,
        questions: [...questions, { id: newId, status: "current" as const }]
      };
    }),
  clear: () => set({ visible: false, totalQuestions: 0, doneCount: 0, questions: [] }),
}));
