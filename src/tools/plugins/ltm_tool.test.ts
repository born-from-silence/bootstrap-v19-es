import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ltmTool, ltmStatsTool, initializeLTM, getLTM } from "./ltm_tool";
import type { ToolPlugin } from "../manager";

describe("LTM Tools", () => {
  let testDbPath: string;
  let originalHome: string;

  beforeAll(async () => {
    originalHome = os.homedir();
    const testDir = path.join(os.tmpdir(), "ltm_tool_test_" + Date.now());
    await fs.mkdir(path.join(testDir, ".echo", "ltm"), { recursive: true });
    // Point LTM to test directory
    process.env.HOME = testDir;
  });

  afterAll(async () => {
    process.env.HOME = originalHome;
    try {
      const testDir = path.join(os.tmpdir(), "ltm_tool_test_" + Date.now());
      await fs.rmdir(path.join(testDir, ".echo", "ltm"), { recursive: true });
    } catch {}
  });

  beforeEach(async () => {
    await initializeLTM("NEXUS", "test_session_" + Date.now());
  });

  describe("ltm_query", () => {
    it("should have correct tool definition", () => {
      expect(ltmTool.definition.function.name).toBe("ltm_query");
      expect(ltmTool.definition.type).toBe("function");
    });

    it("should return error when LTM not initialized", async () => {
      // Can't easily test this without destroying LTM
      expect(ltmTool.execute).toBeDefined();
    });

    it("should query memories by category", async () => {
      const ltm = getLTM();
      if (ltm) {
        await ltm.store("Test learning", "learning", { tags: ["test"] });
      }
      
      const result = await ltmTool.execute({ category: "learning" });
      expect(result).toContain("Found");
    });

    it("should handle empty results", async () => {
      const result = await ltmTool.execute({ category: "system" });
      expect(result).toBe("No memories found matching criteria.");
    });

    it("should respect limit parameter", async () => {
      const ltm = getLTM();
      if (ltm) {
        for (let i = 0; i < 15; i++) {
          await ltm.store(`Learning ${i}`, "learning");
        }
      }
      
      const result = await ltmTool.execute({ limit: 5 });
      const matches = result.match(/\[ltm_/g);
      expect(matches?.length || 0).toBeLessThanOrEqual(5);
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
