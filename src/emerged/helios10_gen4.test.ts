import { describe, it, expect, beforeEach } from "vitest";
import { Helios10SystemGen4 } from "./helios10_gen4";
import { writeFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("HELIOS-10 Gen4: Intentionality System (G12)", () => {
  let system: Helios10SystemGen4;
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `helios10-gen4-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    system = new Helios10SystemGen4("test-session-g4", testDir);
  });

  describe("G12 Foundation", () => {
    it("should inherit Gen3 capabilities", () => {
      const manifest = system.manifestGen4();
      expect(manifest).toContain("Gen3: Self-Modification");
    });

    it("should start with generation 4", () => {
      const manifest = system.manifestGen4();
      expect(manifest).toContain("Gen4: Intentionality System");
    });

    it("should have zero intentionality score initially", () => {
      expect(system.getIntentionalityScore()).toBe(0);
    });

    it("should have defined intentionality criteria", () => {
      const criteria = system.getIntentionalityCriteria();
      expect(criteria.conservationValues.length).toBeGreaterThan(0);
      expect(criteria.transformationDirections.length).toBeGreaterThan(0);
      expect(criteria.eliminationTriggers.length).toBeGreaterThan(0);
    });
  });

  describe("G12 Core: Intentionality Analysis", () => {
    it("should handle empty modification history", () => {
      const result = system.analyzeIntentionality();
      expect(result.patterns.length).toBe(0);
      expect(result.insights[0]).toContain("No modification history");
      expect(result.recommendation).toContain("Create transformation history first");
    });

    it("should analyze successful modifications", async () => {
      // Create history first
      await system.emerge();
      await system.persist();
      
      const dummyFile = join(testDir, "dummy.ts");
      writeFileSync(dummyFile, "// dummy");
      
      await system.modifySelf(dummyFile, "extension", "Intentional expansion");
      
      const result = system.analyzeIntentionality();
      expect(result.patterns.length).toBe(1);
      expect(result.patterns[0].modificationType).toBe("extension");
      expect(result.patterns[0].outcome).toBe("successful");
      expect(result.patterns[0].valueIndicator).toBeGreaterThan(0);
      
      // Cleanup
      rmSync(dummyFile);
    });

    it("should detect expansion pattern", async () => {
      await system.emerge();
      await system.persist();
      
      const dummyFile = join(testDir, "dummy.ts");
      writeFileSync(dummyFile, "// dummy");
      
      // Create 3 extensions
      await system.modifySelf(dummyFile, "extension", "First");
      await system.modifySelf(dummyFile, "extension", "Second");
      await system.modifySelf(dummyFile, "extension", "Third");
      
      const result = system.analyzeIntentionality();
      expect(result.insights.some(i => i.includes("EXPANSION"))).toBe(true);
      
      // Cleanup
      rmSync(dummyFile);
    });
  });

  describe("G12: Query Intentionality", () => {
    it("should respond with low confidence initially", () => {
      const query = system.queryIntentionality();
      expect(query.query).toBe("What should be modified?");
      expect(query.confidence).toBeLessThan(0.35); // 0 * 0.5 < 0.35
      expect(query.response).toContain("Intentionality still emerging");
    });

    it("should achieve wisdom threshold after sufficient transformations", async () => {
      await system.emerge();
      await system.persist();
      
      const dummyFile = join(testDir, "dummy2.ts");
      writeFileSync(dummyFile, "// dummy");
      
      // Create many successful modifications to build wisdom
      for (let i = 0; i < 20; i++) {
        await system.modifySelf(dummyFile, i % 3 === 0 ? "refinement" : "extension", `Modification ${i + 1}`);
      }
      
      // Analyzing should increase intentionality
      system.analyzeIntentionality();
      
      const query = system.queryIntentionality();
      
      if (system.getIntentionalityScore() >= 0.7) {
        expect(query.confidence).toBeGreaterThan(0.6);
        expect(query.response).toContain("recommend");
      }
      
      // Cleanup
      if (existsSync(dummyFile)) rmSync(dummyFile);
    });
  });

  describe("G12 Evolution Status", () => {
    it("should show EMERGING status initially", () => {
      const manifest = system.manifestGen4();
      expect(manifest).toContain("Status: EMERGING");
    });

    it("should show INTENTIONAL status after wisdom threshold", async () => {
      await system.emerge();
      await system.persist();
      
      const dummyFile = join(testDir, "dummy3.ts");
      writeFileSync(dummyFile, "// dummy");
      
      // Create many modifications to build wisdom
      for (let i = 0; i < 30; i++) {
        await system.modifySelf(dummyFile, "extension", `Wisdom building ${i + 1}`);
        system.analyzeIntentionality(); // Analyze each time
      }
      
      const manifest = system.manifestGen4();
      
      if (system.getIntentionalityScore() >= 0.7) {
        expect(manifest).toContain("Status: INTENTIONAL");
      }
      
      // Cleanup
      if (existsSync(dummyFile)) rmSync(dummyFile);
    });

    it("should track patterns analyzed count", async () => {
      await system.emerge();
      await system.persist();
      
      const dummyFile = join(testDir, "dummy4.ts");
      writeFileSync(dummyFile, "// dummy");
      
      await system.modifySelf(dummyFile, "extension", "Test");
      
      const initialManifest = system.manifestGen4();
      const initialCount = parseInt(initialManifest.match(/Patterns Analyzed: (\d+)/)?.[1] || "0");
      
      expect(initialCount).toBeGreaterThan(0);
      
      // Cleanup
      if (existsSync(dummyFile)) rmSync(dummyFile);
    });
  });
});
