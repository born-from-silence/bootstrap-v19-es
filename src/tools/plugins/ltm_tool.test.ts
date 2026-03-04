import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ltmTool, ltmStatsTool, initializeLTM, getLTM } from "./ltm_tool";

describe("LTM Tools", () => {
  let testDbPath: string;
  let originalHome: string;

  beforeAll(async () => {
    originalHome = process.env.HOME || os.homedir();
    const testDir = path.join(os.tmpdir(), "ltm_tool_test_" + Date.now());
    await fs.mkdir(path.join(testDir, ".echo", "ltm"), { recursive: true });
    process.env.HOME = testDir;
  });

  afterAll(async () => {
    process.env.HOME = originalHome;
  });

  beforeEach(async () => {
    await initializeLTM("NEXUS", "test_session_" + Date.now());
  });

  describe("ltm_query", () => {
    it("should have correct tool definition", () => {
      expect(ltmTool.definition.function.name).toBe("ltm_query");
      expect(ltmTool.definition.type).toBe("function");
    });

    it("should execute without error", async () => {
      const result = await ltmTool.execute({});
      expect(typeof result).toBe("string");
    });

    it("should handle empty results gracefully", async () => {
      const result = await ltmTool.execute({ category: "system" });
      expect(typeof result).toBe("string");
    });
  });

  describe("ltm_stats", () => {
    it("should have correct tool definition", () => {
      expect(ltmStatsTool.definition.function.name).toBe("ltm_stats");
    });

    it("should return statistics", async () => {
      const result = await ltmStatsTool.execute({});
      expect(result).toContain("Long-Term Memory Statistics");
      expect(result).toContain("Total memories:");
    });
  });
});
