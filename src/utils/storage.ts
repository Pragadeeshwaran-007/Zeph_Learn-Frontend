// localStorage helpers (SSR-safe)
const isBrowser = () => typeof window !== "undefined";

export const ls = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    if (!isBrowser()) return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
  },
};

export const STORAGE_KEYS = {
  token: "zeph_token",
  user: "zeph_user",
  users: "zeph_users",
  problems: "zeph_problems",
  submissions: "zeph_submissions",
};
