/**
 * Problem solving flow integration tests.
 * Tests: load problem → run code → submit → see results.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { problemService } from "@/services/problemService";
import { submissionService } from "@/services/submissionService";
import { judge0Service } from "@/services/judge0Service";
import { ls, STORAGE_KEYS } from "@/utils/storage";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import {
  MOCK_JWT_TOKEN,
  MOCK_USER_REGULAR,
  MOCK_SUBMIT_RESPONSE_ACCEPTED,
  MOCK_SUBMIT_RESPONSE_WRONG,
  MOCK_SUBMISSIONS,
} from "@/test/fixtures/zephlearn-data";

const BASE = "https://zeph-learn-backend.onrender.com";

describe("Problem solving flow — integration", () => {
  beforeEach(() => {
    localStorage.clear();
    ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);
    ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);
  });

  // ─── Load problem ──────────────────────────────────────────────────────────

  describe("problemService.get() — load problem detail", () => {
    it("fetches 'Two Sum' (id=1) with correct structure", async () => {
      const problem = await problemService.get("1");

      expect(problem).not.toBeUndefined();
      expect(problem?.id).toBe("1");
      expect(problem?.title).toBe("Two Sum");
      expect(problem?.difficulty).toBe("Easy");
      expect(problem?.category).toBe("Arrays");
    });

    it("separates sample and hidden test cases", async () => {
      const problem = await problemService.get("1");

      // Fixture: Two Sum has 2 sample, 1 hidden
      expect(problem?.sampleTestCases.length).toBe(2);
      expect(problem?.hiddenTestCases.length).toBe(1);
    });

    it("returns sample test case with input and expectedOutput", async () => {
      const problem = await problemService.get("1");
      const first = problem?.sampleTestCases[0];

      expect(first?.input).toBe("2 7 11 15\n9");
      expect(first?.expectedOutput).toBe("0 1");
    });

    it("returns undefined for non-existent problem (404)", async () => {
      const problem = await problemService.get("99999");
      expect(problem).toBeUndefined();
    });

    it("fetches 'Validate Binary Search Tree' with Trees, DFS category", async () => {
      const problem = await problemService.get("3");
      expect(problem?.title).toBe("Validate Binary Search Tree");
      expect(problem?.category).toBe("Trees, DFS");
      expect(problem?.difficulty).toBe("Medium");
    });
  });

  // ─── Problem list ──────────────────────────────────────────────────────────

  describe("problemService.list()", () => {
    it("returns all problems", async () => {
      const problems = await problemService.list();
      expect(problems.length).toBe(5);
    });

    it("includes problems of all difficulties", async () => {
      const problems = await problemService.list();
      const difficulties = problems.map((p) => p.difficulty);

      expect(difficulties).toContain("Easy");
      expect(difficulties).toContain("Medium");
      expect(difficulties).toContain("Hard");
    });

    it("all problems have string ids (not numbers)", async () => {
      const problems = await problemService.list();
      for (const p of problems) {
        expect(typeof p.id).toBe("string");
      }
    });

    it("'Merge K Sorted Lists' is Hard difficulty", async () => {
      const problems = await problemService.list();
      const mergeProblem = problems.find((p) => p.title === "Merge K Sorted Lists");
      expect(mergeProblem?.difficulty).toBe("Hard");
    });
  });

  // ─── Run code ─────────────────────────────────────────────────────────────

  describe("judge0Service.submit() — run code", () => {
    it("runs Two Sum in Python and returns Accepted result", async () => {
      const result = await judge0Service.submit({
        source_code: "# correct Two Sum solution",
        language_id: 71, // Python
        stdin: "2 7 11 15\n9",
        expected_output: "0 1",
      });

      expect(result.status.description).toBe("Accepted");
      expect(result.stdout).toBe("0 1\n");
    });

    it("run result includes execution time", async () => {
      const result = await judge0Service.submit({
        source_code: "x = 1",
        language_id: 71,
      });

      expect(result.time).toBeDefined();
    });

    it("compile error returns stderr output", async () => {
      const result = await judge0Service.submit({
        source_code: "COMPILE_ERROR bad syntax",
        language_id: 71,
      });

      expect(result.stderr).toContain("SyntaxError");
      expect(result.status.description).toBe("Compilation Error");
    });
  });

  // ─── Submit solution ───────────────────────────────────────────────────────

  describe("submissionService.submit() — submit for judging", () => {
    it("returns Accepted verdict with all test cases passed", async () => {
      const result = await submissionService.submit("1", "# correct code", "python");

      expect(result.verdict).toBe("Accepted");
      expect(result.passedCount).toBe(3);
      expect(result.totalCount).toBe(3);
    });

    it("Accepted result includes per-test-case results", async () => {
      const result = await submissionService.submit("1", "# correct code", "python");

      expect(result.results.length).toBe(3);
      expect(result.results.every((r) => r.passed)).toBe(true);
    });

    it("returns Wrong Answer verdict when code contains WRONG marker", async () => {
      const result = await submissionService.submit("1", "# WRONG solution", "python");

      expect(result.verdict).toBe("Wrong Answer");
      expect(result.passedCount).toBeLessThan(result.totalCount);
    });

    it("Wrong Answer result shows failed test case output diff", async () => {
      const result = await submissionService.submit("1", "# WRONG solution", "python");

      const failedCase = result.results.find((r) => !r.passed);
      expect(failedCase).toBeDefined();
      expect(failedCase?.expectedOutput).toBeDefined();
      expect(failedCase?.actualOutput).toBeDefined();
    });

    it("throws Error when submission fails (non-ok response)", async () => {
      server.use(
        http.post(`${BASE}/api/submissions/submit`, () =>
          new HttpResponse("Submission timeout", { status: 503 })
        )
      );

      await expect(
        submissionService.submit("1", "# code", "python")
      ).rejects.toThrow("Submission failed: 503");
    });
  });

  // ─── Submission history ────────────────────────────────────────────────────

  describe("submissionService.list() — submission history", () => {
    it("returns user's submission history", async () => {
      const submissions = await submissionService.list("101");

      expect(submissions.length).toBe(3);
    });

    it("includes 'Two Sum' Accepted submission", async () => {
      const submissions = await submissionService.list("101");
      const accepted = submissions.find((s) => s.verdict === "Accepted");

      expect(accepted).toBeDefined();
      expect(accepted?.problem).toBe("Two Sum");
    });

    it("includes Wrong Answer and Time Limit Exceeded submissions", async () => {
      const submissions = await submissionService.list("101");
      const verdicts = submissions.map((s) => s.verdict);

      expect(verdicts).toContain("Accepted");
      expect(verdicts).toContain("Wrong Answer");
      expect(verdicts).toContain("Time Limit Exceeded");
    });

    it("returns empty array for user with no submissions", async () => {
      const submissions = await submissionService.list("999");
      expect(submissions).toEqual([]);
    });

    it("returns empty array when no userId provided", async () => {
      const submissions = await submissionService.list(undefined);
      expect(submissions).toEqual([]);
    });
  });

  // ─── Submission by problem ─────────────────────────────────────────────────

  describe("submissionService.listByProblem()", () => {
    it("returns submissions for a specific problem", async () => {
      const submissions = await submissionService.listByProblem("1");
      expect(submissions.length).toBeGreaterThan(0);
      expect(submissions.every((s) => s.problemId === "1")).toBe(true);
    });
  });
});
