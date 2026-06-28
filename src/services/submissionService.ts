import { ls, STORAGE_KEYS } from "@/utils/storage";

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: number;
  verdict: string;
  time: string;
  memory: number;
  submittedAt: string;
}

export const submissionService = {
  list(): Submission[] {
    const raw = ls.get<Submission[]>(STORAGE_KEYS.submissions, []);
    return Array.isArray(raw) ? raw : [];
  },
  add(s: Omit<Submission, "id" | "submittedAt">) {
    const all = this.list();
    all.unshift({ ...s, id: `s-${Date.now()}`, submittedAt: new Date().toISOString() });
    ls.set(STORAGE_KEYS.submissions, all);
  },
  countByUser(userId: string) {
    return this.list().filter((s) => s.userId === userId).length;
  },
};
