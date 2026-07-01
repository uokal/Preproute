const USER_KEY = "preproute_user";

let _token: string | null = null;

export const authStorage = {
  getToken: () => _token,
  setToken: (token: string) => { _token = token; },
  clear: () => {
    _token = null;
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
