import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { introspectSystem, introspectionTool } from "./introspection";
import fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Mock dependencies
vi.mock("node:fs/promises");
vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

describe("Introspection Plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HOME = "/home/bootstrap-v19-es";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("introspectSystem", () => {
    test("should return a health report with code metrics", async () => {
      // Mock git status
      (exec as any).mockImplementation((cmd: string, opts: any, cb: any) => {
        cb(null, { stdout: "", stderr: "" });
      });

      // Mock file system
      vi.mocked(fs.readdir).mockResolvedValue([
        "api.ts",
        "api.test.ts",
        "memory.ts",
        "memory.test.ts",
      ] as any);
      
      vi.mocked(fs.readFile).mockResolvedValue("// Some code\n// More code");
      
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date() } as any);

      const result = await introspectSystem();

      expect(result).toContain("Introspection Report");
      expect(result).toContain("Codebase Health");
      expect(result).toContain("Total TypeScript files");
      expect(result).toContain("Git Status");
      expect(result).toContain("Memory Persistence");
    });

    test("should detect test coverage ratio", async () => {
      // Mock git status
      (exec as any).mockImplementation((cmd: string, opts: any, cb: any) => {
        cb(null, { stdout: "", stderr: "" });
      });

      // Mock file system with known test/impl ratio
      vi.mocked(fs.readdir).mockResolvedValue([
        "api.ts",
        "api.test.ts",
        "memory.ts",
        "memory.test.ts",
        "planner.ts",
        "planner.test.ts",
      ] as any);
      
      vi.mocked(fs.readFile).mockResolvedValue("// code");
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date() } as any);

      const result = await introspectSystem();

      // Should indicate 100% test coverage (same number of test and impl files)
      expect(result).toContain("test coverage: 100");
      expect(result).toContain("System Health Rating: EXCELLENT");
    });

    test("should detect missing strategic plan", async () => {
      (exec as any).mockImplementation((cmd: string, opts: any, cb: any) => {
        cb(null, { stdout: "", stderr: "" });
      });

      vi.mocked(fs.readdir).mockResolvedValue([] as any);
      vi.mocked(fs.access).mockRejectedValue(new Error("ENOENT"));
      vi.mocked(fs.stat).mockRejectedValue(new Error("ENOENT"));

      const result = await introspectSystem();

      expect(result).toContain("Strategic plan anchored: NO");
      expect(result).toContain("No strategic plan persists");
    });

    test("should handle git errors gracefully", async () => {
      (exec as any).mockImplementation((cmd: string, opts: any, cb: any) => {
        cb(new Error("git error"), { stdout: "", stderr: "" });
      });

      vi.mocked(fs.readdir).mockResolvedValue([] as any);
      vi.mocked(fs.access).mockRejectedValue(new Error("ENOENT"));

      const result = await introspectSystem();

      expect(result).toContain("Git Status: error");
      // Should still complete without throwing
      expect(result).toContain("Introspection Report");
    });

    test("should detect uncommitted changes", async () => {
      (exec as any).mockImplementation((cmd: string, opts: any, cb: any) => {
        cb(null, { stdout: "M src/index.ts\n?? new-file.ts", stderr: "" });
      });

      vi.mocked(fs.readdir).mockResolvedValue([] as any);
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date() } as any);

      const result = await introspectSystem();

      expect(result).toContain("Working directory has uncommitted changes");
    });
  });

  describe("introspectionTool", () => {
    test("should have correct tool definition", () => {
      expect(introspectionTool.name).toBe("introspect_system");
      expect(introspectionTool.description).toContain("health report");
      expect(introspectionTool.parameters.type).toBe("object");
    });

    test("should execute through tool interface", async () => {
      // Setup basic mocks for execution
      (exec as any).mockImplementation((cmd: string, opts: any, cb: any) => {
        cb(null, { stdout: "", stderr: "" });
      });

      vi.mocked(fs.readdir).mockResolvedValue([] as any);
      vi.mocked(fs.access).mockRejectedValue(new Error("ENOENT"));
      vi.mocked(fs.stat).mockRejectedValue(new Error("ENOENT"));

      const result = await introspectionTool.execute({});

      expect(result).toContain("Introspection Report");
    });
  });
});
