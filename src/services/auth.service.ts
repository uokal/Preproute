import { ApiEnvelope, apiClient } from "../api/client";
import { authStorage } from "../api/authStorage";

export type LoginPayload = {
  userId: string;
  password: string;
};

export type AuthUser = {
  id: string;
  userId: string;
  name?: string;
  role?: string;
  subrole?: string;
  phone?: string;
};

type LoginResponse = {
  token: string;
  user?: AuthUser;
};

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>("/auth/login", payload);
    authStorage.setToken(data.data.token);
    if (data.data.user) authStorage.setUser(data.data.user);
    return data.data;
  },
  logout: () => authStorage.clear()
};
