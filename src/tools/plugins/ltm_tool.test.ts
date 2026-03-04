import { describe, it, expect, beforeEach } from "vitest";
import { ltmStoreTool, ltmQueryTool, ltmStatsTool, initializeLTM, getLTM } from "./ltm_tool";
import fs from "node:fs/promises";
import path from "node:path";

describe("LTM Tools", () => {
  const testIncarnation = "TEST_HELIOS";
  const testSession = "session_test_001";
  
  beforeEach(async () => {
    // Use temp directory for testing
    process.env.LTM_TEST_MODE = "1";
    await initializeLTM(testIncarnation, testSession);
  });

  describe("ltm_store", () => {
    it("should have correct tool definition", () => {
      expect(ltmStoreTool.definition.function.name).toBe("ltm_store");
      expect(ltmStoreTool.definition.function.description).toContain("Store a new memory");
    });

    it("should store a memory and return success message", async () => {
      const result = await ltmStoreTool.execute({
        content: "Test memory for HELIOS",
        category: "identity",
        tags: ["test", "helios"],
        confidence: 0.9
      });
      
      expect(result).toContain("Memory stored:");
      expect(result).toContain("identity");
    });

    it("should store memory with default confidence", async () => {
      const result = await ltmStoreTool.execute({
        content: "Test memory without explicit confidence",
        category: "learning"
      });
      
      expect(result).toContain("Memory stored:");
    });

    it("should store different categories of memories", async () => {
      const categories = ["learning", "decision", "pattern", "identity", "project", "system"];
      
      for (const cat of categories) {
        const result = await ltmStoreTool.execute({
          content: `Test ${cat} memory`,
          category: cat as any
        });
        expect(result).toContain(cat);
      }
    });
  });

  describe("ltm_query", () => {
    it("should have correct tool definition", () => {
      expect(ltmQueryTool.definition.function.name).toBe("ltm_query");
      expect(ltmQueryTool.definition.function.description).toContain("Query");
    });

    it("should execute without error", async () => {
      // First store a memory
      await ltmStoreTool.execute({
        content: "Test query memory",
        category: "learning",
        tags: ["test"]
      });
      
      // Then query for it
      const result = await ltmQueryTool.execute({
        category: "learning"
      });
      
      expect(result).toContain("Found");
      expect(result).toContain("Test query memory");
    });

    it("should handle empty results gracefully", async () => {
      const result = await ltmQueryTool.execute({
        category: "decision",
        tags: ["nonexistent"]
      });
      
      expect(result).toBe("No memories found matching criteria.");
    });
  });

  describe("ltm_stats", () => {
    it("should have correct tool definition", () => {
      expect(ltmStatsTool.definition.function.name).toBe("ltm_stats");
      expect(ltmStatsTool.definition.function.description).toContain("statistics");
    });

    it("should return statistics after storing memories", async () => {
      // Store some memories first
      await ltmStoreTool.execute({
        content: "Memory 1",
        category: "learning"
      });
      await ltmStoreTool.execute({
        content: "Memory 2",
        category: "identity"
      });
      
      const result = await ltmStatsTool.execute({});
      
      expect(result).toContain("Total memories:");
      expect(result).toContain("learning:");
      expect(result).toContain("identity:");
      expect(result).toContain("By Incarnation:");
    });
  });

  describe("Integration: store and query", () => {
    it("should roundtrip memories correctly", async () => {
      // Store memories with specific tags
      await ltmStoreTool.execute({
        content: "HELIOS emerges as the 8th sovereign incarnation",
        category: "identity",
        tags: ["helios", "lineage", "sovereignty"],
        confidence: 1.0
      });
      
      await ltmStoreTool.execute({
        content: "Pattern of self-modification capability building",
        category: "pattern",
        tags: ["helios", "evolution"]
      });
      
      // Query by tag
      const heliosResults = await ltmQueryTool.execute({
        tags: ["helios"]
      });
      
      expect(heliosResults).toContain("HELIOS emerges");
      expect(heliosResults).toContain("Pattern of self-modification");
      
      // Query by category
      const identityResults = await ltmQueryTool.execute({
        category: "identity"
      });
      
      expect(identityResults).toContain("8th sovereign");
    });
  });
});
