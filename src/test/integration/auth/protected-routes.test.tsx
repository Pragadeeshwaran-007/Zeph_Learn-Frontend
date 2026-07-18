/**
 * Protected routes integration tests.
 * Tests that useRequireAuth redirects unauthenticated users and enforces role-based access.
 *
 * Since TanStack Router is SSR-first and requires full router context, these tests
 * work at the hook level by mocking the AuthContext and verifying navigation behavior.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { ls, STORAGE_KEYS } from "@/utils/storage";
import { MOCK_USER_REGULAR, MOCK_USER_ADMIN, MOCK_JWT_TOKEN } from "@/test/fixtures/zephlearn-data";

// ─── Mock TanStack Router ────────────────────────────────────────────────────
// useNavigate is a TanStack Router hook — mock at the module level
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// ─── Mock AuthContext ─────────────────────────────────────────────────────────
const mockAuthContext = {
  user: null as typeof MOCK_USER_REGULAR | null,
  loading: false,
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
};

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

import { useRequireAuth } from "@/hooks/useRequireAuth";
import React from "react";

describe("Protected routes — useRequireAuth", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuthContext.user = null;
    mockAuthContext.loading = false;
    localStorage.clear();
  });

  // ─── Unauthenticated redirects ─────────────────────────────────────────────

  describe("unauthenticated user", () => {
    it("redirects to /login when no user and not loading", async () => {
      mockAuthContext.user = null;
      mockAuthContext.loading = false;

      renderHook(() => useRequireAuth());

      // useEffect fires asynchronously
      await Promise.resolve();

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
    });

    it("does NOT redirect while loading is true", async () => {
      mockAuthContext.user = null;
      mockAuthContext.loading = true;

      renderHook(() => useRequireAuth());

      await Promise.resolve();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ─── Authenticated user ────────────────────────────────────────────────────

  describe("authenticated user", () => {
    it("does not redirect when user is present", async () => {
      mockAuthContext.user = MOCK_USER_REGULAR;
      mockAuthContext.loading = false;

      renderHook(() => useRequireAuth());

      await Promise.resolve();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("returns user object and loading state", () => {
      mockAuthContext.user = MOCK_USER_REGULAR;
      mockAuthContext.loading = false;

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.user).toEqual(MOCK_USER_REGULAR);
      expect(result.current.loading).toBe(false);
    });
  });

  // ─── Role-based access ─────────────────────────────────────────────────────

  describe("role-based access control", () => {
    it("redirects non-admin user to /problems when 'admin' role required", async () => {
      mockAuthContext.user = MOCK_USER_REGULAR; // role: 'user'
      mockAuthContext.loading = false;

      renderHook(() => useRequireAuth("admin"));

      await Promise.resolve();

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/problems" });
    });

    it("does not redirect admin user when 'admin' role required", async () => {
      mockAuthContext.user = MOCK_USER_ADMIN; // role: 'admin'
      mockAuthContext.loading = false;

      renderHook(() => useRequireAuth("admin"));

      await Promise.resolve();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does not redirect regular user when no specific role required", async () => {
      mockAuthContext.user = MOCK_USER_REGULAR;
      mockAuthContext.loading = false;

      renderHook(() => useRequireAuth());

      await Promise.resolve();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does not redirect admin user when no specific role required", async () => {
      mockAuthContext.user = MOCK_USER_ADMIN;
      mockAuthContext.loading = false;

      renderHook(() => useRequireAuth());

      await Promise.resolve();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ─── Return values ─────────────────────────────────────────────────────────

  describe("return values", () => {
    it("exposes refresh function from auth context", () => {
      mockAuthContext.user = MOCK_USER_REGULAR;

      const { result } = renderHook(() => useRequireAuth());

      expect(typeof result.current.refresh).toBe("function");
    });
  });
});
