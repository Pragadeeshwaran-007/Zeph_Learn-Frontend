import { ls, STORAGE_KEYS } from "@/utils/storage";
import { SEED_PROBLEMS } from "@/utils/seedData";

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

function ensureSeed() {
  const existing = ls.get<Problem[] | null>(STORAGE_KEYS.problems, null);
  if (!existing || existing.length === 0) ls.set(STORAGE_KEYS.problems, SEED_PROBLEMS);
}

export const problemService = {
  list(): Problem[] {
    ensureSeed();
    return ls.get<Problem[]>(STORAGE_KEYS.problems, SEED_PROBLEMS);
  },
  get(id: string): Problem | undefined {
    return this.list().find((p) => p.id === id);
  },
  save(p: Problem) {
    const all = this.list();
    const idx = all.findIndex((x) => x.id === p.id);
    if (idx >= 0) all[idx] = p;
    else all.push({ ...p, id: p.id || `p-${Date.now()}` });
    ls.set(STORAGE_KEYS.problems, all);
  },
  remove(id: string) {
    ls.set(STORAGE_KEYS.problems, this.list().filter((p) => p.id !== id));
  },
};
