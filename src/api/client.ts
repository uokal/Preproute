import axios, { AxiosError } from "axios";
import { authStorage } from "./authStorage";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      authStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again.") => {
  if (axios.isAxiosError<{ message?: string; error?: string; errors?: Record<string, string[]> }>(error)) {
    if (!error.response) return null;

    const serverMessage = error.response.data?.message ?? error.response.data?.error;
    if (serverMessage) return serverMessage;

    if (error.response.status === 401) return "Your session has expired. Please sign in again.";
    if (error.response.status === 403) return "You do not have permission to perform this action.";
    if (error.response.status === 404) return "We could not find the requested resource.";
    if (error.response.status === 422) return "Please review the highlighted fields and try again.";
    if (error.response.status >= 500) return "The server is having trouble. Please try again shortly.";

    return error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export type ApiEnvelope<T> = {
  status: string;
  message?: string;
  data: T;
};
