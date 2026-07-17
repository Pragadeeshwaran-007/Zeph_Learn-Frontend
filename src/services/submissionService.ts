import { ls, STORAGE_KEYS } from "@/utils/storage";

const BASE = import.meta.env.VITE_API_BASE_URL || "https://zeph-learn-backend.onrender.com";

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

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  problem?: string;
  code: string;
  language: number;
  verdict: string;
  time: string;
  memory: number;
  submittedAt: string;
}

export interface SubmitResponse {
  verdict: string;
  passedCount: number;
  totalCount: number;
  results: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    executionTime: string;
  }[];
  executionTime: string;
  memory: string;
}

export const submissionService = {
  async list(userId?: string): Promise<Submission[]> {
    if (!userId) return [];
    const res = await fetch(`${BASE}/api/submissions/user/${encodeURIComponent(userId)}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  },
  
  async listByProblem(problemId: string): Promise<Submission[]> {
    const res = await fetch(`${BASE}/api/submissions/problem/${encodeURIComponent(problemId)}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  },
  
  async submit(problemId: string, code: string, language: string): Promise<SubmitResponse> {
    const res = await fetch(`${BASE}/api/submissions/submit`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        problemId: Number(problemId),
        code,
        language,
      }),
    });
    
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Submission failed: ${res.status} ${t.slice(0, 120)}`);
    }
    
    return await res.json();
  }
};
