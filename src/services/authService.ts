import { ls, STORAGE_KEYS } from "@/utils/storage";

const BASE = import.meta.env.VITE_API_BASE_URL || "https://zeph-learn-backend.onrender.com";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  solvedProblems: string[];
  createdAt: string;
}

export type PublicUser = User;

export const authService = {
  async login(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const response = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Invalid credentials");
    const data = await response.json();
    const token = data.token;
    const user: PublicUser = {
      id: String(data.id),
      name: data.name,
      email: data.email,
      role: data.role?.toLowerCase() === "admin" ? "admin" : "user",
      solvedProblems: [],
      createdAt: new Date().toISOString(),
    };
    ls.set(STORAGE_KEYS.token, token);
    ls.set(STORAGE_KEYS.user, user);
    return { user, token };
  },

  async signup(
    name: string,
    email: string,
    password: string,
  ): Promise<{ user: PublicUser; token: string }> {
    const response = await fetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) throw new Error("Email already in use");
    const data = await response.json();
    const token = data.token;
    const user: PublicUser = {
      id: String(data.id),
      name: data.name,
      email: data.email,
      role: data.role?.toLowerCase() === "admin" ? "admin" : "user",
      solvedProblems: [],
      createdAt: new Date().toISOString(),
    };
    ls.set(STORAGE_KEYS.token, token);
    ls.set(STORAGE_KEYS.user, user);
    return { user, token };
  },

  logout() {
    ls.remove(STORAGE_KEYS.token);
    ls.remove(STORAGE_KEYS.user);
  },

  current(): PublicUser | null {
    return ls.get<PublicUser | null>(STORAGE_KEYS.user, null);
  },

  listUsers(): PublicUser[] {
    return [];
  },

  deleteUser(_id: string) {},

  markSolved(userId: string, problemId: string) {
    const cur = ls.get<PublicUser | null>(STORAGE_KEYS.user, null);
    if (cur && cur.id === userId && !cur.solvedProblems.includes(problemId)) {
      cur.solvedProblems.push(problemId);
      ls.set(STORAGE_KEYS.user, cur);
    }
  },
};
