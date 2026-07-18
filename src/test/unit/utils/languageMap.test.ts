import { describe, it, expect } from "vitest";
import { LANGUAGES, getLanguage } from "@/utils/languageMap";

describe("languageMap", () => {
  describe("LANGUAGES constant", () => {
    it("contains all four supported languages", () => {
      const names = LANGUAGES.map((l) => l.name);
      expect(names).toContain("C++");
      expect(names).toContain("Java");
      expect(names).toContain("Python");
      expect(names).toContain("JavaScript");
    });

    it("has correct Judge0 language IDs", () => {
      // These IDs map to Judge0/Piston language IDs — if they change, submissions break
      const ids = LANGUAGES.map((l) => l.id);
      expect(ids).toContain(54); // C++
      expect(ids).toContain(62); // Java
      expect(ids).toContain(71); // Python
      expect(ids).toContain(63); // JavaScript
    });

    it("has valid monaco language identifiers", () => {
      const monacoIds = LANGUAGES.map((l) => l.monaco);
      expect(monacoIds).toContain("cpp");
      expect(monacoIds).toContain("java");
      expect(monacoIds).toContain("python");
      expect(monacoIds).toContain("javascript");
    });

    it("each language has a non-empty boilerplate", () => {
      for (const lang of LANGUAGES) {
        expect(lang.boilerplate.length).toBeGreaterThan(0);
      }
    });

    it("Python boilerplate is valid Python comment", () => {
      const python = LANGUAGES.find((l) => l.id === 71)!;
      expect(python.boilerplate).toContain("#");
    });

    it("C++ boilerplate includes main() entry point", () => {
      const cpp = LANGUAGES.find((l) => l.id === 54)!;
      expect(cpp.boilerplate).toContain("int main()");
      expect(cpp.boilerplate).toContain("#include");
    });

    it("Java boilerplate includes Main class and main method", () => {
      const java = LANGUAGES.find((l) => l.id === 62)!;
      expect(java.boilerplate).toContain("public class Main");
      expect(java.boilerplate).toContain("public static void main");
    });
  });

  describe("getLanguage()", () => {
    it("returns Python for id 71", () => {
      const lang = getLanguage(71);
      expect(lang.name).toBe("Python");
      expect(lang.monaco).toBe("python");
    });

    it("returns C++ for id 54", () => {
      const lang = getLanguage(54);
      expect(lang.name).toBe("C++");
    });

    it("returns Java for id 62", () => {
      const lang = getLanguage(62);
      expect(lang.name).toBe("Java");
    });

    it("returns JavaScript for id 63", () => {
      const lang = getLanguage(63);
      expect(lang.name).toBe("JavaScript");
    });

    it("returns first language (Python) as fallback for unknown id", () => {
      // Default is LANGUAGES[0] — important for submission routing
      const lang = getLanguage(9999);
      expect(lang).toEqual(LANGUAGES[0]);
    });
  });
});
