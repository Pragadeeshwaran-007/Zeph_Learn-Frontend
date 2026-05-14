import { ls, STORAGE_KEYS } from "@/utils/storage";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // mock-only
  role: "admin" | "user";
  solvedProblems: string[];
  createdAt: string;
}

export type PublicUser = Omit<User, "password">;

const SEED_USERS: User[] = [
  {
    id: "u-admin",
    name: "Admin",
    email: "admin@zephlearn.com",
    password: "admin123",
    role: "admin",
    solvedProblems: [],
    createdAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "u-student",
    name: "Student",
    email: "user@zephlearn.com",
    password: "user123",
    role: "user",
    solvedProblems: [],
    createdAt: new Date("2024-01-02").toISOString(),
  },
];

function ensureSeed() {
  const existing = ls.get<User[] | null>(STORAGE_KEYS.users, null);
  if (!existing || existing.length === 0) ls.set(STORAGE_KEYS.users, SEED_USERS);
}

function getAll(): User[] {
  ensureSeed();
  return ls.get<User[]>(STORAGE_KEYS.users, SEED_USERS);
}

function strip(u: User): PublicUser {
  const { password: _p, ...rest } = u;
  return rest;
}

export const authService = {
  login(email: string, password: string): { user: PublicUser; token: string } {
    const users = getAll();
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u || u.password !== password) throw new Error("Invalid credentials");
    const token = btoa(`${u.id}:${Date.now()}`);
    ls.set(STORAGE_KEYS.token, token);
    ls.set(STORAGE_KEYS.user, strip(u));
    return { user: strip(u), token };
  },
  signup(name: string, email: string, password: string): { user: PublicUser; token: string } {
    const users = getAll();
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already in use");
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      password,
      role: "user",
      solvedProblems: [],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    ls.set(STORAGE_KEYS.users, users);
    const token = btoa(`${newUser.id}:${Date.now()}`);
    ls.set(STORAGE_KEYS.token, token);
    ls.set(STORAGE_KEYS.user, strip(newUser));
    return { user: strip(newUser), token };
  },
  logout() {
    ls.remove(STORAGE_KEYS.token);
    ls.remove(STORAGE_KEYS.user);
  },
  current(): PublicUser | null {
    return ls.get<PublicUser | null>(STORAGE_KEYS.user, null);
  },
  listUsers(): PublicUser[] {
    return getAll().map(strip);
  },
  deleteUser(id: string) {
    const users = getAll().filter((u) => u.id !== id);
    ls.set(STORAGE_KEYS.users, users);
  },
  markSolved(userId: string, problemId: string) {
    const users = getAll();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx < 0) return;
    if (!users[idx].solvedProblems.includes(problemId)) {
      users[idx].solvedProblems.push(problemId);
      ls.set(STORAGE_KEYS.users, users);
      const cur = ls.get<PublicUser | null>(STORAGE_KEYS.user, null);
      if (cur && cur.id === userId) ls.set(STORAGE_KEYS.user, strip(users[idx]));
    }
  },
};
