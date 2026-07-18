import { describe, it, expect, beforeEach } from "vitest";
import { ls, STORAGE_KEYS } from "@/utils/storage";

describe("storage helpers (ls)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("ls.get", () => {
    it("returns fallback when key does not exist", () => {
      expect(ls.get("nonexistent", "default")).toBe("default");
    });

    it("returns fallback when value is not valid JSON", () => {
      localStorage.setItem("bad-key", "{broken json");
      expect(ls.get("bad-key", null)).toBeNull();
    });

    it("retrieves a stored string", () => {
      localStorage.setItem("zeph_token", JSON.stringify("my-jwt-token"));
      expect(ls.get("zeph_token", null)).toBe("my-jwt-token");
    });

    it("retrieves a stored object", () => {
      const user = { id: "101", name: "Priya Suresh", role: "user" };
      localStorage.setItem("zeph_user", JSON.stringify(user));
      expect(ls.get("zeph_user", null)).toEqual(user);
    });

    it("returns numeric fallback correctly", () => {
      expect(ls.get<number>("missing_num", 42)).toBe(42);
    });

    it("retrieves an array", () => {
      const arr = ["problem-1", "problem-2"];
      localStorage.setItem("solved", JSON.stringify(arr));
      expect(ls.get("solved", [])).toEqual(arr);
    });
  });

  describe("ls.set", () => {
    it("stores a string as JSON", () => {
      ls.set(STORAGE_KEYS.token, "abc-token");
      expect(localStorage.getItem(STORAGE_KEYS.token)).toBe('"abc-token"');
    });

    it("stores an object", () => {
      const user = { id: "101", name: "Priya Suresh" };
      ls.set(STORAGE_KEYS.user, user);
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      expect(JSON.parse(raw!)).toEqual(user);
    });

    it("stores null", () => {
      ls.set("nullable-key", null);
      expect(JSON.parse(localStorage.getItem("nullable-key")!)).toBeNull();
    });

    it("overwrites existing value", () => {
      ls.set(STORAGE_KEYS.token, "old-token");
      ls.set(STORAGE_KEYS.token, "new-token");
      expect(ls.get(STORAGE_KEYS.token, null)).toBe("new-token");
    });
  });

  describe("ls.remove", () => {
    it("removes a key", () => {
      ls.set(STORAGE_KEYS.token, "to-delete");
      ls.remove(STORAGE_KEYS.token);
      expect(ls.get(STORAGE_KEYS.token, null)).toBeNull();
    });

    it("does not throw when key does not exist", () => {
      expect(() => ls.remove("ghost-key")).not.toThrow();
    });
  });

  describe("STORAGE_KEYS constants", () => {
    it("has expected keys", () => {
      expect(STORAGE_KEYS.token).toBe("zeph_token");
      expect(STORAGE_KEYS.user).toBe("zeph_user");
      expect(STORAGE_KEYS.problems).toBe("zeph_problems");
      expect(STORAGE_KEYS.submissions).toBe("zeph_submissions");
    });
  });
});
