import { ApiEnvelope, apiClient } from "../api/client";
import { ApiSubTopic, ApiTopic } from "./apiTypes";

export const topicsService = {
  bySubject: async (subjectId: string) => {
    const { data } = await apiClient.get<ApiEnvelope<ApiTopic[]>>(`/topics/subject/${subjectId}`);
    return data.data;
  },
  subTopicsByTopics: async (topicIds: string[]) => {
    if (!topicIds.length) return [];
    const { data } = await apiClient.post<ApiEnvelope<ApiSubTopic[]>>("/sub-topics/multi-topics", { topicIds });
    return data.data;
  }
};
