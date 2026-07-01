const TOKEN_KEY = "preproute_token";
const USER_KEY = "preproute_user";

export const authStorage = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  setUser: (user: unknown) => sessionStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: <T,>() => {
    const value = sessionStorage.getItem(USER_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
};
