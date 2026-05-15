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

function storedToken(): string | null {
  const raw = ls.get<string | null>(STORAGE_KEYS.token, null);
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

function authReadHeaders(): HeadersInit {
  const t = storedToken();
  return {
    Accept: "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

function mapApiUser(row: Record<string, unknown>): PublicUser | null {
  const id = row.id ?? row.userId;
  if (id == null || id === "") return null;
  const roleRaw = String(row.role ?? row.authority ?? "user").toLowerCase();
  const role: "admin" | "user" =
    roleRaw === "admin" || roleRaw.includes("admin") ? "admin" : "user";
  let solved: string[] = [];
  const sp = row.solvedProblems ?? row.solved_problems ?? row.solvedProblemIds;
  if (Array.isArray(sp)) solved = sp.map((x) => String(x));
  const created =
    (typeof row.createdAt === "string" && row.createdAt) ||
    (typeof row.created_at === "string" && row.created_at) ||
    new Date().toISOString();
  return {
    id: String(id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    role,
    solvedProblems: solved,
    createdAt: created,
  };
}

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

  async listUsers(): Promise<PublicUser[]> {
    const response = await fetch(`${BASE}/api/admin/users`, {
      method: "GET",
      headers: authReadHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) return [];
      const t = await response.text();
      throw new Error(`Failed to load users: ${response.status} ${t.slice(0, 120)}`);
    }
    const raw: unknown = await response.json();
    const rows: unknown[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray((raw as { content?: unknown }).content)
        ? ((raw as { content: unknown[] }).content as unknown[])
        : raw && typeof raw === "object" && Array.isArray((raw as { users?: unknown }).users)
          ? ((raw as { users: unknown[] }).users as unknown[])
          : [];
    return rows
      .filter(
        (r): r is Record<string, unknown> =>
          r != null && typeof r === "object" && !Array.isArray(r),
      )
      .map((r) => mapApiUser(r))
      .filter((u): u is PublicUser => u != null);
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${BASE}/api/admin/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: authReadHeaders(),
    });
    if (!response.ok) {
      const t = await response.text();
      throw new Error(`Delete failed: ${response.status} ${t.slice(0, 120)}`);
    }
  },

  markSolved(userId: string, problemId: string) {
    const cur = ls.get<PublicUser | null>(STORAGE_KEYS.user, null);
    if (cur && cur.id === userId && !cur.solvedProblems.includes(problemId)) {
      cur.solvedProblems.push(problemId);
      ls.set(STORAGE_KEYS.user, cur);
    }
  },
};
