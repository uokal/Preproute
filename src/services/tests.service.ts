import { ApiEnvelope, apiClient } from "../api/client";
import { ApiTest, TestPayload, mapApiTest } from "./apiTypes";

export const testsService = {
  list: async () => {
    const { data } = await apiClient.get<ApiEnvelope<ApiTest[]>>("/tests");
    return data.data.map((test) => mapApiTest(test));
  },
  get: async (id: string) => {
    const { data } = await apiClient.get<ApiEnvelope<ApiTest>>(`/tests/${id}`);
    return data.data;
  },
  create: async (payload: TestPayload) => {
    const { data } = await apiClient.post<ApiEnvelope<ApiTest>>("/tests", payload);
    return data.data;
  },
  update: async (id: string, payload: TestPayload) => {
    const { data } = await apiClient.put<ApiEnvelope<ApiTest>>(`/tests/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/tests/${id}`);
  }
};
