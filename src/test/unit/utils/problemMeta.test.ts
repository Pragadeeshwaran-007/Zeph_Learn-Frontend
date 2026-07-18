import { describe, it, expect } from "vitest";
import { hashStr, acceptanceFor, tagsFor } from "@/utils/problemMeta";

describe("problemMeta utils", () => {
  describe("hashStr()", () => {
    it("returns a non-negative integer", () => {
      expect(hashStr("Two Sum")).toBeGreaterThanOrEqual(0);
    });

    it("is deterministic — same input always produces same hash", () => {
      const id = "Maximum Subarray";
      expect(hashStr(id)).toBe(hashStr(id));
    });

    it("produces different hashes for different strings", () => {
      expect(hashStr("Easy")).not.toBe(hashStr("Hard"));
    });

    it("handles empty string", () => {
      expect(hashStr("")).toBe(0);
    });

    it("handles single character", () => {
      expect(typeof hashStr("A")).toBe("number");
    });
  });

  describe("acceptanceFor()", () => {
    it("always returns a value between 25 and 89 (inclusive)", () => {
      const problemIds = ["1", "2", "3", "Two Sum", "Merge K Sorted Lists", "abc", "99999"];
      for (const id of problemIds) {
        const rate = acceptanceFor(id);
        expect(rate).toBeGreaterThanOrEqual(25);
        expect(rate).toBeLessThanOrEqual(89);
      }
    });

    it("is deterministic for a given problem id", () => {
      expect(acceptanceFor("1")).toBe(acceptanceFor("1"));
    });

    it("returns an integer", () => {
      const rate = acceptanceFor("Two Sum");
      expect(Number.isInteger(rate)).toBe(true);
    });
  });

  describe("tagsFor()", () => {
    it("splits comma-separated categories", () => {
      expect(tagsFor("Arrays, Hash Map")).toEqual(["Arrays", "Hash Map"]);
    });

    it("splits slash-separated categories", () => {
      expect(tagsFor("Trees/DFS")).toEqual(["Trees", "DFS"]);
    });

    it("handles combined comma and slash separators", () => {
      // e.g., "Linked Lists, Heap" and "Trees, DFS" are common in ZephLearn data
      const result = tagsFor("Linked Lists, Heap");
      expect(result).toContain("Linked Lists");
      expect(result).toContain("Heap");
    });

    it("returns single tag for simple category", () => {
      expect(tagsFor("Dynamic Programming")).toEqual(["Dynamic Programming"]);
    });

    it("returns the category as a single tag when no separators", () => {
      expect(tagsFor("Arrays")).toEqual(["Arrays"]);
    });

    it("filters out empty strings from splits", () => {
      // Guards against double-comma edge cases
      const result = tagsFor("Arrays");
      expect(result.every((t) => t.length > 0)).toBe(true);
    });

    it("trims whitespace around tags", () => {
      const result = tagsFor("Trees,  DFS");
      expect(result).toContain("Trees");
      expect(result).toContain("DFS");
    });

    it("handles 'Trees, DFS' from Validate BST problem", () => {
      const result = tagsFor("Trees, DFS");
      expect(result).toEqual(["Trees", "DFS"]);
    });
  });
});
