/**
 * Integration tests for the login flow.
 *
 * Tests the full pipeline: form render → validation → API call → JWT stored → redirect.
 * MSW intercepts all network calls.
 *
 * NOTE: TanStack Router requires a router context to render routes.
 * We test authService directly for flow correctness and use lightweight
 * wrappers for component-level checks.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/services/authService";
import { ls, STORAGE_KEYS } from "@/utils/storage";
import { MOCK_JWT_TOKEN, MOCK_ADMIN_JWT_TOKEN } from "@/test/fixtures/zephlearn-data";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

const BASE = "https://zeph-learn-backend.onrender.com";

describe("Login flow — integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── Form validation (business logic layer) ───────────────────────────────

  describe("credential validation", () => {
    it("valid credentials → token stored in localStorage", async () => {
      await authService.login("priya@example.com", "password123");
      expect(ls.get(STORAGE_KEYS.token, null)).toBe(MOCK_JWT_TOKEN);
    });

    it("valid credentials → user object stored in localStorage", async () => {
      await authService.login("priya@example.com", "password123");
      const user = ls.get<{ id: string; name: string }>(STORAGE_KEYS.user, null);
      expect(user?.id).toBe("101");
      expect(user?.name).toBe("Priya Suresh");
    });

    it("wrong password → throws 'Invalid credentials', no token stored", async () => {
      await expect(
        authService.login("priya@example.com", "wrongpassword")
      ).rejects.toThrow("Invalid credentials");
      expect(ls.get(STORAGE_KEYS.token, null)).toBeNull();
    });

    it("unknown email → throws 'Invalid credentials'", async () => {
      await expect(
        authService.login("nobody@nowhere.com", "any")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  // ─── JWT and role routing ─────────────────────────────────────────────────

  describe("JWT and role detection", () => {
    it("regular user login → role is 'user'", async () => {
      const { user } = await authService.login("priya@example.com", "password123");
      expect(user.role).toBe("user");
    });

    it("admin user login → role is 'admin'", async () => {
      const { user } = await authService.login("admin@zephlearn.com", "admin123");
      expect(user.role).toBe("admin");
      expect(ls.get(STORAGE_KEYS.token, null)).toBe(MOCK_ADMIN_JWT_TOKEN);
    });

    it("login result includes streak from auth response", async () => {
      const { user } = await authService.login("priya@example.com", "password123");
      expect(user.streak).toBe(5);
    });
  });

  // ─── API error scenarios ───────────────────────────────────────────────────

  describe("API error handling", () => {
    it("server 500 error → throws with message from backend", async () => {
      server.use(
        http.post(`${BASE}/api/auth/login`, () =>
          HttpResponse.json({ error: "Database connection failed" }, { status: 500 })
        )
      );

      await expect(
        authService.login("priya@example.com", "password123")
      ).rejects.toThrow("Database connection failed");
    });

    it("server 500 with empty body → throws fallback 'Invalid credentials'", async () => {
      server.use(
        http.post(`${BASE}/api/auth/login`, () =>
          new HttpResponse(null, { status: 500 })
        )
      );

      await expect(
        authService.login("priya@example.com", "password123")
      ).rejects.toThrow("Invalid credentials");
    });

    it("network failure on Google login → throws 'Network error'", async () => {
      server.use(
        http.post(`${BASE}/api/auth/google`, () => HttpResponse.error())
      );

      await expect(
        authService.loginWithGoogle("some-google-token")
      ).rejects.toThrow("Network error");
    });
  });

  // ─── CORS / request headers ───────────────────────────────────────────────

  describe("request headers (CORS contract)", () => {
    it("login request sends Content-Type: application/json", async () => {
      let capturedContentType: string | null = null;

      server.use(
        http.post(`${BASE}/api/auth/login`, ({ request }) => {
          capturedContentType = request.headers.get("Content-Type");
          return HttpResponse.json({
            token: MOCK_JWT_TOKEN,
            id: "101",
            name: "Priya Suresh",
            email: "priya@example.com",
            role: "user",
            streak: 5,
          });
        })
      );

      await authService.login("priya@example.com", "password123");
      expect(capturedContentType).toBe("application/json");
    });

    it("fetchProfile sends Authorization: Bearer <token>", async () => {
      let capturedAuth: string | null = null;

      ls.set(STORAGE_KEYS.user, {
        id: "101",
        name: "Priya Suresh",
        email: "priya@example.com",
        role: "user",
        solvedProblems: [],
        streak: 5,
        createdAt: "2025-01-15T08:00:00Z",
      });
      ls.set(STORAGE_KEYS.token, MOCK_JWT_TOKEN);

      server.use(
        http.get(`${BASE}/api/users/profile/101`, ({ request }) => {
          capturedAuth = request.headers.get("Authorization");
          return HttpResponse.json({
            id: "101",
            name: "Priya Suresh",
            email: "priya@example.com",
            role: "user",
            solvedProblemIds: [],
            streak: 5,
            rank: 42,
          });
        })
      );

      await authService.fetchProfile("101");
      expect(capturedAuth).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
    });
  });
});
