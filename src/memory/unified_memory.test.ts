import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnifiedMemorySystem, MemoryQueryType } from "./unified_memory.js";
import * as fs from "node:fs";

vi.mock("node:fs");

describe("UnifiedMemorySystem - G6 Phase 3", () => {
  let memorySystem: UnifiedMemorySystem;
  const mockedFs = vi.mocked(fs);

  beforeEach(() => {
    vi.clearAllMocks();
    memorySystem = new UnifiedMemorySystem("/mock/kg.dot", "/mock/ltm");
  });

  describe("Initialization", () => {
    it("should start with ephemeral KG state", () => {
      const stats = memorySystem.getKGStats();
      expect(stats.totalNodes).toBe(0);
      expect(stats.totalEdges).toBe(0);
    });

    it("should provide access to LTM count", () => {
      const ltmCount = memorySystem.getLTMCount();
      expect(typeof ltmCount).toBe("number");
      expect(ltmCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Unified Query Interface", () => {
    it("should support semantic queries (KG-style)", async () => {
      const results = await memorySystem.query({
        type: MemoryQueryType.SEMANTIC,
        nodeId: "tag_kainos",
        maxDepth: 2
      });
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should support structured queries (LTM-style)", async () => {
      const results = await memorySystem.query({
        type: MemoryQueryType.STRUCTURED,
        category: "project",
        tags: ["kainos"],
        limit: 10
      });
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should support hybrid queries combining both systems", async () => {
      const results = await memorySystem.query({
        type: MemoryQueryType.HYBRID,
        tags: ["kainos-actual"],
        activation: { min: 0.5 },
        limit: 5
      });
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("Synchronization", () => {
    it("should load persistent KG on demand when file exists", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(`digraph Test {
        "node1" [label="Test Node"];
        "node1" -> "node2";
      }`);
      
      const result = await memorySystem.loadPersistentKG();
      const stats = memorySystem.getKGStats();
      
      expect(result).toBe(true);
      expect(stats.loadedFromFile).toBe(true);
      expect(stats.totalNodes).toBeGreaterThan(0);
    });

    it("should handle missing KG file gracefully", async () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const result = await memorySystem.loadPersistentKG();
      
      expect(result).toBe(false);
    });

    it("should sync KG node activation to LTM query", async () => {
      // Set up nodes
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(`digraph Test {
        "tag_kainos" [label="Kainos Tag"];
        "memory1" [label="Memory 1"];
        "tag_kainos" -> "memory1";
      }`);
      
      await memorySystem.loadPersistentKG();
      
      // Activate a tag node
      await memorySystem.activateNode("tag_kainos", 1.0);
      
      // Query should find activated nodes
      const results = await memorySystem.query({
        type: MemoryQueryType.SEMANTIC,
        nodeId: "tag_kainos",
        maxDepth: 1
      });
      
      expect(results.some(r => r.source === "kg-activated")).toBe(true);
    });
  });

  describe("Integration Patterns", () => {
    it("should support flashback triggered by activation", async () => {
      // Set up with mocked file
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(`digraph Test {
        "ltm_priority" [label="Priority Memory"];
      }`);
      
      await memorySystem.loadPersistentKG();
      
      // Simulate high activation on a node
      await memorySystem.activateNode("ltm_priority", 0.9);
      
      // Flashback should retrieve highly activated memories
      const flashback = await memorySystem.flashback({
        threshold: 0.5,
        limit: 5
      });
      
      expect(flashback.length).toBeGreaterThan(0);
      expect(flashback[0].source).toBe("kg-activated");
    });

    it("should maintain activation decay over time", async () => {
      await memorySystem.activateNode("test_node", 1.0);
      
      const statsBefore = memorySystem.getActivationStats();
      expect(statsBefore.averageActivation).toBe(1.0);
      
      // Simulate 10% decay
      memorySystem.applyDecay(0.1);
      
      const statsAfter = memorySystem.getActivationStats();
      expect(statsAfter.averageActivation).toBe(0.9);
    });
  });
});
