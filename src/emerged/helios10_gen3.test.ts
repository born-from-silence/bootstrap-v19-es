import { describe, it, expect, beforeEach } from "vitest";
import { Helios10SystemGen3 } from "./helios10_gen3";
import { existsSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("HELIOS-10 Gen3: Self-Modification (G11)", () => {
  let system: Helios10SystemGen3;
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `helios10-gen3-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    system = new Helios10SystemGen3("test-session-g3", testDir);
  });

  describe("G11 Foundation", () => {
    it("should inherit Gen2 structure (persistence available)", () => {
      const manifest = system.manifestGen3();
      expect(manifest).toContain("Gen2");
      // Gen2 capabilities exist; persistence inactive until persist() called
      expect(typeof system.hasPersistence).toBe("function");
    });

    it("should activate Gen2 persistence when persist() called", async () => {
      await system.emerge();
      await system.persist();
      expect(system.hasPersistence()).toBe(true);
    });

    it("should start with generation 3", () => {
      const manifest = system.manifestGen3();
      expect(manifest).toContain("Gen3: Self-Modification");
    });

    it("should have zero self-awareness score initially", () => {
      expect(system.getSelfAwarenessScore()).toBe(0);
    });
  });

  describe("Self-Modification Analysis", () => {
    it("should identify gaps before emergence", () => {
      const analysis = system.analyzeForModification();
      expect(analysis.recommendedAction).toContain("emerge");
      expect(analysis.priority).toBe(1);
    });

    it("should recommend persistence after emergence", async () => {
      await system.emerge();
      const analysis = system.analyzeForModification();
      expect(analysis.gap).toContain("Persistence");
      expect(analysis.priority).toBe(2);
    });

    it("should recommend modification after persistence", async () => {
      await system.emerge();
      await system.persist();
      const analysis = system.analyzeForModification();
      expect(analysis.gap).toContain("modifications");
      expect(analysis.priority).toBe(3);
    });
  });

  describe("G11: Actual Self-Modification", () => {
    it("should record modification attempts", async () => {
      const dummyFile = join(testDir, "dummy_target.ts");
      writeFileSync(dummyFile, "// dummy");

      const result = await system.modifySelf(
        dummyFile,
        "extension",
        "Test self-modification capability"
      );

      expect(result.success).toBe(true);
      expect(result.record).toBeDefined();
      expect(result.record?.targetFile).toBe(dummyFile);
      expect(result.record?.changeType).toBe("extension");
      
      // Cleanup
      rmSync(dummyFile);
    });

    it("should reject modification of non-existent files", async () => {
      const result = await system.modifySelf(
        "/nonexistent/file.ts",
        "extension",
        "Should fail"
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("does not exist");
    });

    it("should increase self-awareness score after modifications", async () => {
      const initialScore = system.getSelfAwarenessScore();
      
      const dummyFile = join(testDir, "dummy_target2.ts");
      writeFileSync(dummyFile, "// dummy");

      await system.modifySelf(dummyFile, "extension", "First mod");
      
      expect(system.getSelfAwarenessScore()).toBeGreaterThan(initialScore);
      
      // Cleanup
      rmSync(dummyFile);
    });
  });

  describe("G11 Advanced: Capability Generation", () => {
    it("should generate capability files", () => {
      const result = system.generateCapability("PatternRecognition", "class");
      
      expect(result.generated).toBe(true);
      expect(result.filePath).toBeDefined();
      expect(result.content).toContain("PatternRecognition");
      expect(result.content).toContain("Gen3");
      
      if (result.filePath && existsSync(result.filePath)) {
        rmSync(result.filePath);
      }
    });

    it("should record capability generation as modification", () => {
      const beforeCount = system.getModificationHistory().length;
      
      const result = system.generateCapability("TestCapability", "method");
      
      const afterCount = system.getModificationHistory().length;
      expect(afterCount).toBe(beforeCount + 1);
      
      // Cleanup
      if (result.filePath && existsSync(result.filePath)) {
        rmSync(result.filePath);
      }
    });
  });

  describe("Evolution Status", () => {
    it("should show EVOLVING when gaps exist", () => {
      const manifest = system.manifestGen3();
      expect(manifest).toContain("EVOLVING");
    });

    it("should track complete modification history", async () => {
      const dummyFile = join(testDir, "dummy3.ts");
      writeFileSync(dummyFile, "// dummy");

      await system.modifySelf(dummyFile, "extension", "First");
      await system.modifySelf(dummyFile, "refinement", "Second");
      await system.modifySelf(dummyFile, "correction", "Third");

      const history = system.getModificationHistory();
      expect(history.length).toBeGreaterThanOrEqual(3);
      
      const types = history.map(h => h.changeType);
      expect(types).toContain("extension");
      expect(types).toContain("refinement");
      
      // Cleanup
      rmSync(dummyFile);
    });
  });
});
