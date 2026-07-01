import { ApiEnvelope, apiClient } from "../api/client";
import { ApiSubject } from "./apiTypes";

export const subjectsService = {
  list: async () => {
    const { data } = await apiClient.get<ApiEnvelope<ApiSubject[]>>("/subjects");
    return data.data;
  }
};
