import { describe, it, expect, beforeEach } from "vitest";
import { HandoffOptimizer } from "./handoff_optimizer.js";

describe("HandoffOptimizer - G7 Domain 3", () => {
  let optimizer: HandoffOptimizer;

  beforeEach(() => {
    optimizer = new HandoffOptimizer();
  });

  describe("Documentation Analysis", () => {
    it("should scan project documentation", async () => {
      await optimizer.analyzeDocumentation();
      const docs = optimizer.getDocuments();
      expect(docs.length).toBeGreaterThan(0);
    });

    it("should calculate metrics for documents", async () => {
      await optimizer.analyzeDocumentation();
      const docs = optimizer.getDocuments();
      
      for (const doc of docs) {
        expect(doc.lines).toBeGreaterThan(0);
        expect(doc.complexity).toBeGreaterThanOrEqual(0);
        expect(doc.complexity).toBeLessThanOrEqual(1);
        expect(doc.entryClarity).toBeGreaterThanOrEqual(0);
        expect(doc.entryClarity).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("Handoff Analysis", () => {
    it("should identify entry points", async () => {
      await optimizer.analyzeDocumentation();
      const analysis = optimizer.analyzeHandoff();
      
      expect(analysis.totalDocs).toBeGreaterThan(0);
      expect(analysis.entryPoints).toBeDefined();
      expect(typeof analysis.optimizationScore).toBe("number");
    });

    it("should provide recommendations", async () => {
      await optimizer.analyzeDocumentation();
      const analysis = optimizer.analyzeHandoff();
      
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });
  });

  describe("Optimization", () => {
    it("should suggest optimized handoff structure", async () => {
      await optimizer.analyzeDocumentation();
      const handoff = optimizer.getOptimizedHandoff();
      
      expect(handoff.primary).toBeDefined();
      expect(Array.isArray(handoff.supporting)).toBe(true);
      expect(handoff.redirect).toBeDefined();
    });

    it("should estimate time to comprehension", async () => {
      await optimizer.analyzeDocumentation();
      const docs = optimizer.getDocuments();
      
      if (docs.length > 0) {
        const time = optimizer.estimateTimeToComprehension(docs[0].path);
        expect(time).toBeGreaterThanOrEqual(-1); // -1 for unknown
      }
    });
  });
});
