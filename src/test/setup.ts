/**
 * Global test setup — runs once before each test file.
 */
import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// ─── RTL cleanup ──────────────────────────────────────────────────────────────
afterEach(() => {
  cleanup();
});

// ─── MSW lifecycle ────────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── localStorage mock ────────────────────────────────────────────────────────
// jsdom provides localStorage, but we want to clear it between tests.
beforeEach(() => {
  localStorage.clear();
});

// ─── window.matchMedia stub (required by some Radix components) ───────────────
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ─── ResizeObserver stub ──────────────────────────────────────────────────────
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ─── IntersectionObserver stub ───────────────────────────────────────────────
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ─── scrollIntoView stub ─────────────────────────────────────────────────────
window.HTMLElement.prototype.scrollIntoView = vi.fn();
