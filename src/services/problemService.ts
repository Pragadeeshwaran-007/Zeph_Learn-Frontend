import { ls, STORAGE_KEYS } from "@/utils/storage";

const BASE = import.meta.env.VITE_API_BASE_URL || "https://zeph-learn-backend.onrender.com";

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
}

// Backend shape
interface ApiTestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

interface ApiProblem {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  testCases: ApiTestCase[];
}

function storedToken(): string | null {
  const raw = ls.get<string | null>(STORAGE_KEYS.token, null);
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

function authHeaders(): HeadersInit {
  const t = storedToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

function fromApi(p: ApiProblem): Problem {
  const testCases: ApiTestCase[] = Array.isArray(p.testCases) ? p.testCases : [];
  return {
    id: String(p.id),
    title: p.title ?? "",
    difficulty: (p.difficulty as Difficulty) ?? "Easy",
    category: p.category ?? "",
    description: p.description ?? "",
    inputFormat: p.inputFormat ?? "",
    outputFormat: p.outputFormat ?? "",
    constraints: p.constraints ?? "",
    sampleTestCases: testCases
      .filter((tc) => !tc.hidden)
      .map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
    hiddenTestCases: testCases
      .filter((tc) => tc.hidden)
      .map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
  };
}

function toApi(p: Problem): Omit<ApiProblem, "id"> {
  const testCases: ApiTestCase[] = [
    ...p.sampleTestCases.map((tc) => ({ ...tc, hidden: false })),
    ...p.hiddenTestCases.map((tc) => ({ ...tc, hidden: true })),
  ];
  return {
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    description: p.description,
    inputFormat: p.inputFormat,
    outputFormat: p.outputFormat,
    constraints: p.constraints,
    testCases,
  };
}

async function handleError(res: Response, fallback: string): Promise<never> {
  try {
    const text = await res.text();
    if (text) {
      const data = JSON.parse(text) as { error?: string; message?: string };
      const msg = data?.error ?? data?.message;
      if (msg) throw new Error(msg);
    }
  } catch (e) {
    if (e instanceof Error && e.message !== fallback && e.name !== "SyntaxError") throw e;
  }
  throw new Error(fallback);
}

export const problemService = {
  async list(): Promise<Problem[]> {
    const res = await fetch(`${BASE}/api/problems`, {
      headers: authHeaders(),
    });
    if (!res.ok) return handleError(res, "Failed to load problems");
    const data: unknown = await res.json();
    const rows = Array.isArray(data) ? data : [];
    return rows.map((row) => fromApi(row as ApiProblem));
  },

  async get(id: string): Promise<Problem | undefined> {
    const res = await fetch(`${BASE}/api/problems/${encodeURIComponent(id)}`, {
      headers: authHeaders(),
    });
    if (res.status === 404) return undefined;
    if (!res.ok) return handleError(res, "Failed to load problem");
    const data: ApiProblem = await res.json();
    return fromApi(data);
  },

  async save(p: Problem): Promise<Problem> {
    const isNew = !p.id || p.id === "";
    const url = isNew
      ? `${BASE}/api/problems`
      : `${BASE}/api/problems/${encodeURIComponent(p.id)}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(toApi(p)),
    });
    if (!res.ok) return handleError(res, isNew ? "Failed to create problem" : "Failed to update problem");
    const data: ApiProblem = await res.json();
    return fromApi(data);
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${BASE}/api/problems/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) return handleError(res, "Failed to delete problem");
  },
};
