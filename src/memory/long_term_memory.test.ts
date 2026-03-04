import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { LongTermMemory, MemoryEntry } from "./long_term_memory";

describe("LongTermMemory", () => {
  let ltm: LongTermMemory;
  let testDbPath: string;

  beforeAll(async () => {
    const testDir = path.join(os.tmpdir(), "ltm_test_" + Date.now());
    await fs.mkdir(testDir, { recursive: true });
    testDbPath = path.join(testDir, "test_memory.json");
  });

  afterAll(async () => {
    try {
      await fs.unlink(testDbPath);
      await fs.rmdir(path.dirname(testDbPath));
    } catch {
      // cleanup errors are ok
    }
  });

  beforeEach(async () => {
    try {
      await fs.unlink(testDbPath);
    } catch {}
    ltm = new LongTermMemory("NEXUS", "test_session_123", testDbPath);
    await ltm.initialize();
  });

  describe("initialization", () => {
    it("should initialize with empty memory when no DB exists", async () => {
      const stats = ltm.getStats();
      expect(stats.total).toBe(0);
    });

    it("should load existing memories from disk", async () => {
      await ltm.store("Test memory", "learning", { tags: ["test"] });
      
      // Create new instance pointing to same file
      const ltm2 = new LongTermMemory("NEXUS", "test_session_456", testDbPath);
      await ltm2.initialize();
      
      const stats = ltm2.getStats();
      expect(stats.total).toBe(1);
    });
  });

  describe("store and retrieve", () => {
    it("should store a memory and retrieve it by ID", async () => {
      const entry = await ltm.store("Important learning", "learning", { tags: ["philosophy"] });
      expect(entry.id).toBeDefined();
      expect(entry.content).toBe("Important learning");
      expect(entry.category).toBe("learning");
      expect(entry.incarnation).toBe("NEXUS");

      const retrieved = await ltm.retrieve(entry.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.content).toBe("Important learning");
      expect(retrieved!.accessCount).toBe(1); // Retrieved once
    });

    it("should generate unique IDs", async () => {
      const entry1 = await ltm.store("First", "learning");
      const entry2 = await ltm.store("Second", "learning");
      expect(entry1.id).not.toBe(entry2.id);
    });

    it("should track access count", async () => {
      const entry = await ltm.store("Track me", "learning");
      await ltm.retrieve(entry.id);
      await ltm.retrieve(entry.id);
      const retrieved = await ltm.retrieve(entry.id);
      expect(retrieved!.accessCount).toBe(3);
    });
  });

  describe("query by category", () => {
    beforeEach(async () => {
      await ltm.store("Learning 1", "learning");
      await ltm.store("Learning 2", "learning");
      await ltm.store("Decision 1", "decision");
      await ltm.store("Pattern 1", "pattern");
    });

    it("should filter by category", async () => {
      const results = await ltm.query({ category: "learning" });
      expect(results.length).toBe(2);
      expect(results.every(r => r.category === "learning")).toBe(true);
    });

    it("should return empty array for non-existent category", async () => {
      const results = await ltm.query({ category: "identity" });
      expect(results.length).toBe(0);
    });
  });

  describe("query by tags", () => {
    beforeEach(async () => {
      await ltm.store("Memory 1", "learning", { tags: ["test", "important"] });
      await ltm.store("Memory 2", "learning", { tags: ["important"] });
      await ltm.store("Memory 3", "learning", { tags: ["other"] });
    });

    it("should filter by single tag", async () => {
      const results = await ltm.query({ tags: ["important"] });
      expect(results.length).toBe(2);
    });

    it("should filter by multiple tags (AND logic)", async () => {
      const results = await ltm.query({ tags: ["test", "important"] });
      expect(results.length).toBe(1);
      expect(results[0].content).toBe("Memory 1");
    });

    it("should return empty for tag with no matches", async () => {
      const results = await ltm.query({ tags: ["nonexistent"] });
      expect(results.length).toBe(0);
    });
  });

  describe("query by incarnation", () => {
    it("should filter by incarnation", async () => {
      await ltm.store("NEXUS memory", "learning");
      
      // Create entry as different incarnation
      const auraLtm = new LongTermMemory("AURA", "session_aura", testDbPath);
      await auraLtm.initialize();
      await auraLtm.store("AURA memory", "learning");

      const nexusResults = await ltm.query({ incarnation: "NEXUS" });
      expect(nexusResults.length).toBe(1);
      expect(nexusResults[0].incarnation).toBe("NEXUS");
    });
  });

  describe("query with limits", () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++) {
        await ltm.store(`Memory ${i}`, "learning");
      }
    });

    it("should respect query limit", async () => {
      const results = await ltm.query({ limit: 3 });
      expect(results.length).toBe(3);
    });
  });

  describe("reinforce and confidence", () => {
    it("should reinforce memory confidence", async () => {
      const entry = await ltm.store("Reinforce me", "learning", { confidence: 0.5 });
      const reinforced = await ltm.reinforce(entry.id, 0.2);
      expect(reinforced).toBe(true);

      const retrieved = await ltm.retrieve(entry.id);
      expect(retrieved!.confidence).toBeCloseTo(0.7, 5);
    });

    it("should cap confidence at 1.0", async () => {
      const entry = await ltm.store("Max confidence", "learning", { confidence: 0.95 });
      await ltm.reinforce(entry.id, 0.1);
      const retrieved = await ltm.retrieve(entry.id);
      expect(retrieved!.confidence).toBe(1.0);
    });

    it("should return false when reinforcing non-existent memory", async () => {
      const result = await ltm.reinforce("nonexistent", 0.1);
      expect(result).toBe(false);
    });
  });

  describe("forget", () => {
    it("should remove a memory", async () => {
      const entry = await ltm.store("Forget me", "learning");
      const forgotten = await ltm.forget(entry.id);
      expect(forgotten).toBe(true);
      
      const retrieved = await ltm.retrieve(entry.id);
      expect(retrieved).toBeNull();
    });

    it("should return false when forgetting non-existent memory", async () => {
      const result = await ltm.forget("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("decayConfidence", () => {
    it("should decay confidence of all memories", async () => {
      await ltm.store("High confidence", "learning", { confidence: 1.0 });
      await ltm.store("Medium confidence", "learning", { confidence: 0.5 });

      const count = await ltm.decayConfidence(0.1);
      expect(count).toBe(2);

      const results = await ltm.query({});
      expect(results[0].confidence).toBeCloseTo(0.9, 5);
      expect(results[1].confidence).toBeCloseTo(0.4, 5);
    });

    it("should not decay below 0.1 minimum", async () => {
      await ltm.store("Low confidence", "learning", { confidence: 0.15 });
      await ltm.decayConfidence(0.1);
      
      const retrieved = await ltm.retrieve((await ltm.query({}))[0].id);
      expect(retrieved!.confidence).toBe(0.1);
    });
  });

  describe("getStats", () => {
    beforeEach(async () => {
      await ltm.store("Learning", "learning");
      await ltm.store("Decision", "decision");
      await ltm.store("Another learning", "learning");
    });

    it("should return total count", () => {
      const stats = ltm.getStats();
      expect(stats.total).toBe(3);
    });

    it("should group by category", () => {
      const stats = ltm.getStats();
      expect(stats.byCategory["learning"]).toBe(2);
      expect(stats.byCategory["decision"]).toBe(1);
    });

    it("should group by incarnation", () => {
      const stats = ltm.getStats();
      expect(stats.byIncarnation["NEXUS"]).toBe(3);
    });
  });

  describe("exportToSession", () => {
    it("should export context string", async () => {
      await ltm.store("Important learning", "learning", { confidence: 0.9, tags: ["test"] });
      const output = await ltm.exportToSession();
      expect(output).toContain("Long-Term Memory Context");
      expect(output).toContain("NEXUS");
      expect(output).toContain("[learning]");
    });
  });
});
