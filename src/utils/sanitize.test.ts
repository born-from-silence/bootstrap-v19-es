import { describe, it, expect } from "vitest";
import { sanitizeJsonString } from "./sanitize.js";

describe("sanitizeJsonString", () => {
  describe("Standard JSON escapes (should be preserved)", () => {
    it("should preserve newline escape", () => {
      const input = "line1\\nline2";
      expect(sanitizeJsonString(input)).toBe("line1\\nline2");
    });

    it("should preserve tab escape", () => {
      const input = "col1\\tcol2";
      expect(sanitizeJsonString(input)).toBe("col1\\tcol2");
    });

    it("should preserve carriage return", () => {
      const input = "line\\rline2";
      expect(sanitizeJsonString(input)).toBe("line\\rline2");
    });

    it("should preserve backspace", () => {
      const input = "text\\btext";
      expect(sanitizeJsonString(input)).toBe("text\\btext");
    });

    it("should preserve form feed", () => {
      const input = "page\\fpage";
      expect(sanitizeJsonString(input)).toBe("page\\fpage");
    });

    it("should preserve quote escape", () => {
      const input = 'say \\"hello\\"';
      expect(sanitizeJsonString(input)).toBe('say \\"hello\\"');
    });

    it("should preserve backslash escape", () => {
      const input = "path\\\\file";
      expect(sanitizeJsonString(input)).toBe("path\\\\file");
    });

    it("should preserve forward slash escape", () => {
      const input = "http:\\/\\/example.com";
      expect(sanitizeJsonString(input)).toBe("http:\\/\\/example.com");
    });
  });

  describe("Invalid JSON escapes (should be fixed)", () => {
    it("should remove backtick escape", () => {
      const input = "code\\`template\\`";
      expect(sanitizeJsonString(input)).toBe("code`template`");
    });

    it("should remove dollar escape", () => {
      const input = "price \\$5";
      expect(sanitizeJsonString(input)).toBe("price $5");
    });

    it("should remove single quote escape", () => {
      const input = "it\\'s working";
      expect(sanitizeJsonString(input)).toBe("it's working");
    });

    it("should handle multiple invalid escapes", () => {
      const input = "\\`hello\\` and \\$world";
      expect(sanitizeJsonString(input)).toBe("`hello` and $world");
    });
  });

  describe("Unicode escapes", () => {
    it("should preserve unicode escapes", () => {
      const input = "\\u0048\\u0065\\u006c\\u006c\\u006f";
      expect(sanitizeJsonString(input)).toBe("\\u0048\\u0065\\u006c\\u006c\\u006f");
    });

    it("should preserve unicode escape as first char", () => {
      const input = "\\u0041";
      expect(sanitizeJsonString(input)).toBe("\\u0041");
    });
  });

  describe("Mixed content", () => {
    it("should handle valid and invalid escapes together", () => {
      const input = "Valid: \\n and Invalid: \\'";
      expect(sanitizeJsonString(input)).toBe("Valid: \\n and Invalid: '");
    });

    it("should handle complex LLM output", () => {
      const input = "{code: const x = \\\`value\\\`;\\nconsole.log(x)}";
      const result = sanitizeJsonString(input);
      expect(result).toContain("`value`");
      expect(result).toContain("\\n");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string", () => {
      expect(sanitizeJsonString("")).toBe("");
    });

    it("should handle string without escapes", () => {
      const input = "plain text";
      expect(sanitizeJsonString(input)).toBe("plain text");
    });

    it("should remove invalid escape before valid", () => {
      // Input: backslash + backslash + n
      // First pair is backslash-backslash, second char is n
      // But per regex behavior, this becomes \\n (literal backslash then n)
      const input = "\\\\n";
      const result = sanitizeJsonString(input);
      // Result is single backslash followed by n (both preserved as-is)
      expect(result).toContain("\\");
      expect(result).toContain("n");
    });

    it("should handle trailing backslash", () => {
      const input = "text\\";
      expect(sanitizeJsonString(input)).toBe("text\\");
    });
  });
});
