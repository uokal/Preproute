import { ApiEnvelope, apiClient } from "../api/client";
import { Question } from "../types";
import { ApiQuestion, BulkQuestionPayload, mapApiQuestion } from "./apiTypes";

export const questionsService = {
  bulkCreate: async (payload: BulkQuestionPayload) => {
    const { data } = await apiClient.post<ApiEnvelope<ApiQuestion[]>>("/questions/bulk", payload);
    return data.data;
  },
  fetchBulk: async (questionIds: string[]) => {
    if (!questionIds.length) return [];
    const { data } = await apiClient.post<ApiEnvelope<ApiQuestion[]>>("/questions/fetchBulk", { question_ids: questionIds });
    return data.data.map(mapApiQuestion);
  }
};

export const questionToBulkPayload = (question: Question, testId: string, subjectId: string): BulkQuestionPayload["questions"][number] => ({
  type: "mcq",
  question: question.text,
  option1: question.options[0],
  option2: question.options[1],
  option3: question.options[2],
  option4: question.options[3],
  correct_option: `option${question.correctOption + 1}`,
  explanation: question.explanation,
  difficulty: question.difficulty === "Difficult" ? "hard" : question.difficulty.toLowerCase(),
  test_id: testId,
  subject: subjectId,
  media_url: question.mediaUrl
});
