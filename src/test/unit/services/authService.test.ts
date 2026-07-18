import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/services/authService";
import { ls, STORAGE_KEYS } from "@/utils/storage";
import {
  MOCK_USER_REGULAR,
  MOCK_USER_ADMIN,
  MOCK_JWT_TOKEN,
  MOCK_ADMIN_JWT_TOKEN,
} from "@/test/fixtures/zephlearn-data";

// MSW is handling HTTP; server lifecycle is in setup.ts

describe("authService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── login ──────────────────────────────────────────────────────────────────

  describe("login()", () => {
    it("stores token and user in localStorage on success", async () => {
      const result = await authService.login("priya@example.com", "password123");

      expect(result.user.id).toBe("101");
      expect(result.user.name).toBe("Priya Suresh");
      expect(result.token).toBe(MOCK_JWT_TOKEN);
      expect(ls.get(STORAGE_KEYS.token, null)).toBe(MOCK_JWT_TOKEN);
    });

    it("normalizes solvedProblems to empty array for new login", async () => {
      const result = await authService.login("priya@example.com", "password123");
      expect(Array.isArray(result.user.solvedProblems)).toBe(true);
    });

    it("normalizes streak to number", async () => {
      const result = await authService.login("priya@example.com", "password123");
      expect(typeof result.user.streak).toBe("number");
      expect(result.user.streak).toBe(5);
    });

    it("throws with 'Invalid credentials' on 401", async () => {
      await expect(
        authService.login("wrong@example.com", "wrongpass")
      ).rejects.toThrow("Invalid credentials");
    });

    it("does not store token when login fails", async () => {
      try {
        await authService.login("wrong@example.com", "wrongpass");
      } catch {
        // expected
      }
      expect(ls.get(STORAGE_KEYS.token, null)).toBeNull();
    });

    it("maps admin role correctly", async () => {
      const result = await authService.login("admin@zephlearn.com", "admin123");
      expect(result.user.role).toBe("admin");
      expect(result.token).toBe(MOCK_ADMIN_JWT_TOKEN);
    });
  });

  // ─── signup ─────────────────────────────────────────────────────────────────

  describe("signup()", () => {
    it("stores token and user on successful signup", async () => {
      const result = await authService.signup("Arjun Kumar", "arjun@example.com", "secure123");

      expect(result.user.name).toBe("Arjun Kumar");
      expect(result.user.email).toBe("arjun@example.com");
      expect(result.user.role).toBe("user");
      expect(ls.get(STORAGE_KEYS.token, null)).not.toBeNull();
    });

    it("throws on duplicate email", async () => {
      await expect(
        authService.signup("Someone", "existing@example.com", "pass123")
      ).rejects.toThrow();
    });
  });

  // ─── fetchProfile ────────────────────────────────────────────────────────────

  describe("fetchProfile()", () => {
    it("returns null when no user in storage", async () => {
      const result = await authService.fetchProfile("101");
      expect(result).toBeNull();
    });

    it("returns null when stored user id doesn't match", async () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, id: "999" });
      const result = await authService.fetchProfile("101");
      expect(result).toBeNull();
    });

    it("merges profile data including streak and solvedProblems", async () => {
      ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);
      ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);

      const result = await authService.fetchProfile("101");
      expect(result).not.toBeNull();
      expect(result!.streak).toBe(5);
      expect(result!.rank).toBe(42);
    });

    it("updates localStorage after fetching profile", async () => {
      ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);
      ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);

      await authService.fetchProfile("101");

      const stored = ls.get<typeof MOCK_USER_REGULAR | null>(STORAGE_KEYS.user, null);
      expect(stored).not.toBeNull();
      expect(stored!.streak).toBe(5);
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe("logout()", () => {
    it("removes token and user from localStorage", () => {
      ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);
      ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);

      authService.logout();

      expect(ls.get(STORAGE_KEYS.token, null)).toBeNull();
      expect(ls.get(STORAGE_KEYS.user, null)).toBeNull();
    });
  });

  // ─── current ─────────────────────────────────────────────────────────────────

  describe("current()", () => {
    it("returns null when no user stored", () => {
      expect(authService.current()).toBeNull();
    });

    it("returns normalized user when stored", () => {
      ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);
      const result = authService.current();
      expect(result?.id).toBe("101");
      expect(result?.name).toBe("Priya Suresh");
      expect(Array.isArray(result?.solvedProblems)).toBe(true);
    });

    it("normalizes missing streak to 0", () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, streak: undefined });
      const result = authService.current();
      expect(result?.streak).toBe(0);
    });
  });

  // ─── markSolved ──────────────────────────────────────────────────────────────

  describe("markSolved()", () => {
    it("adds problemId to solvedProblems in localStorage", () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, solvedProblems: [] });

      authService.markSolved("101", "1");

      const stored = ls.get<typeof MOCK_USER_REGULAR>(STORAGE_KEYS.user, null);
      expect(stored?.solvedProblems).toContain("1");
    });

    it("does not add duplicate problemId", () => {
      ls.set(STORAGE_KEYS.user, { ...MOCK_USER_REGULAR, solvedProblems: ["1"] });

      authService.markSolved("101", "1");

      const stored = ls.get<typeof MOCK_USER_REGULAR>(STORAGE_KEYS.user, null);
      expect(stored?.solvedProblems.filter((id: string) => id === "1")).toHaveLength(1);
    });

    it("does nothing when userId doesn't match current user", () => {
      ls.set(STORAGE_KEYS.user, MOCK_USER_REGULAR);

      authService.markSolved("999", "5");

      const stored = ls.get<typeof MOCK_USER_REGULAR>(STORAGE_KEYS.user, null);
      expect(stored?.solvedProblems).not.toContain("5");
    });

    it("optimistically increments streak", () => {
      const initialStreak = 5;
      ls.set(STORAGE_KEYS.user, {
        ...MOCK_USER_REGULAR,
        solvedProblems: ["1", "2"],
        streak: initialStreak,
      });

      authService.markSolved(MOCK_USER_REGULAR.id, "3");

      const stored = ls.get<typeof MOCK_USER_REGULAR>(STORAGE_KEYS.user, null);
      expect(stored?.streak).toBe(initialStreak + 1);
    });
  });

  // ─── loginWithGoogle ─────────────────────────────────────────────────────────

  describe("loginWithGoogle()", () => {
    it("stores token on Google login success", async () => {
      const result = await authService.loginWithGoogle("valid-google-id-token");
      expect(result.token).toBeDefined();
      expect(ls.get(STORAGE_KEYS.token, null)).not.toBeNull();
    });
  });
});
