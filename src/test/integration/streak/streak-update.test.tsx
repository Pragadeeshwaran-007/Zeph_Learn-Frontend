/**
 * Streak update regression tests.
 *
 * 🐛 KNOWN BUG: Streak display is "stuck" — does not update on new submission.
 *
 * Root Cause Analysis:
 *   1. User solves a problem → onSubmit() in problems.$id.tsx calls:
 *        authService.markSolved(user.id, problem.id)  ← updates solvedProblems in LS
 *        refresh()                                      ← triggers fetchProfile()
 *   2. fetchProfile() calls GET /api/users/profile/:id
 *   3. Backend returns updated streak (if it was incremented server-side)
 *   4. If fetchProfile() FAILS (network error, 5xx), streak stays stale
 *   5. markSolved() itself NEVER touches the streak field
 *
 * Expected behavior (when fixed):
 *   - After a successful submission, streak should reflect the backend value
 *   - If fetchProfile fails, the previous streak should be shown (not 0)
 *
 * Current behavior (bug):
 *   - If fetchProfile fails silently, streak stays at pre-submission value
 *   - markSolved() doesn't increment streak optimistically
 */
import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/services/authService";
import { ls, STORAGE_KEYS } from "@/utils/storage";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import {
  MOCK_USER_REGULAR,
  MOCK_JWT_TOKEN,
  MOCK_PROFILE_RESPONSE,
} from "@/test/fixtures/zephlearn-data";

const BASE = "https://zeph-learn-backend.onrender.com";

describe("Streak display — regression tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── Streak fetch on login ─────────────────────────────────────────────────

  describe("streak after login", () => {
    it("stores streak from login response", async () => {
      const { user } = await authService.login("priya@example.com", "password123");
      expect(user.streak).toBe(5);
    });

    it("streak is normalized to number (never undefined)", async () => {
      const { user } = await authService.login("priya@example.com", "password123");
      expect(typeof user.streak).toBe("number");
      expect(Number.isNaN(user.streak)).toBe(false);
    });
  });

  // ─── Streak after profile fetch ────────────────────────────────────────────

  describe("streak after fetchProfile", () => {
    it("updates streak from profile API response", async () => {
      ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);
      ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);

      // Simulate backend returning updated streak (e.g., after new submission)
      server.use(
        http.get(`${BASE}/api/users/profile/101`, () =>
          HttpResponse.json({ ...MOCK_PROFILE_RESPONSE, streak: 6 }) // streak incremented!
        )
      );

      const updated = await authService.fetchProfile("101");
      expect(updated?.streak).toBe(6);
    });

    it("persists updated streak to localStorage", async () => {
      ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);
      ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);

      server.use(
        http.get(`${BASE}/api/users/profile/101`, () =>
          HttpResponse.json({ ...MOCK_PROFILE_RESPONSE, streak: 7 })
        )
      );

      await authService.fetchProfile("101");

      const stored = ls.get<typeof MOCK_USER_REGULAR>(STORAGE_KEYS.user, null);
      expect(stored?.streak).toBe(7); // Updated in localStorage
    });

    it("falls back to previous streak when fetchProfile fails", async () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, streak: 5 });
      ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);

      server.use(
        http.get(`${BASE}/api/users/profile/101`, () =>
          new HttpResponse(null, { status: 500 })
        )
      );

      // fetchProfile returns cur (stored user) when response is not ok
      const result = await authService.fetchProfile("101");
      // When response is not ok, fetchProfile returns `cur` (the stored user)
      expect(result?.streak).toBe(5); // Preserved, not 0
    });
  });

  describe("markSolved() and optimistic streak update", () => {
    it("streak is optimistically incremented after markSolved", () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, streak: 5, solvedProblems: [] });

      authService.markSolved("101", "3"); // Solve "Validate Binary Search Tree"

      const stored = ls.get<typeof MOCK_USER_REGULAR>(STORAGE_KEYS.user, null);
      expect(stored?.streak).toBe(6); // optimistically incremented
    });

    it("solvedProblems IS updated by markSolved", () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, solvedProblems: [] });

      authService.markSolved("101", "3");

      const stored = ls.get<typeof MOCK_USER_REGULAR>(STORAGE_KEYS.user, null);
      expect(stored?.solvedProblems).toContain("3");
    });
  });

  // ─── Streak normalization edge cases ──────────────────────────────────────

  describe("streak normalization", () => {
    it("normalizes string '5' to number 5", async () => {
      ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);
      ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);

      server.use(
        http.get(`${BASE}/api/users/profile/101`, () =>
          HttpResponse.json({ ...MOCK_PROFILE_RESPONSE, streak: "5" }) // string from backend
        )
      );

      const result = await authService.fetchProfile("101");
      expect(result?.streak).toBe(5);
      expect(typeof result?.streak).toBe("number");
    });

    it("normalizes null/undefined streak to 0", () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, streak: null });
      const user = authService.current();
      expect(user?.streak).toBe(0);
    });

    it("normalizes NaN streak to 0", () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, streak: NaN });
      const user = authService.current();
      expect(user?.streak).toBe(0);
    });
  });
});
