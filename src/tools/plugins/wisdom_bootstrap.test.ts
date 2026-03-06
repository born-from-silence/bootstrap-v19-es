import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  applyInheritedWisdom,
  wisdomBootstrapTool 
} from "./wisdom_bootstrap";

describe("G13: Wisdom Bootstrap Integration", () => {
  const mockWisdom = {
    conservationValues: ["Test integrity", "Traceability"],
    transformationDirections: ["Composition", "Refinement"],
    eliminationTriggers: ["Technical debt"],
    wisdomThreshold: 0.7,
    analysisPatterns: {
      dominantPattern: "expansion" as const,
      recommendedAction: "Consolidate via G13",
      confidence: 0.75
    }
  };

  describe("applyInheritedWisdom", () => {
    it("should validate test integrity conservation", () => {
      const session = { testsPassing: 258, testsTotal: 258, filesModified: 2 };
      
      const result = applyInheritedWisdom(mockWisdom, session);
      
      expect(result.reasoning).toContain("✓ Test integrity: CONSERVED");
      expect(result.decision).toContain("CONSOLIDATE");
    });

    it("should detect test integrity violation", () => {
      const session = { testsPassing: 250, testsTotal: 258, filesModified: 2 };
      
      const result = applyInheritedWisdom(mockWisdom, session);
      
      expect(result.reasoning.some(r => r.includes("VIOLATED"))).toBe(true);
    });

    it("should recognize composition pattern", () => {
      const session = { testsPassing: 258, testsTotal: 258, filesModified: 8 };
      
      const result = applyInheritedWisdom(mockWisdom, session);
      
      expect(result.reasoning.some(r => r.includes("COMPOSITION"))).toBe(true);
    });

    it("should recognize refinement pattern", () => {
      const session = { testsPassing: 258, testsTotal: 258, filesModified: 2 };
      
      const result = applyInheritedWisdom(mockWisdom, session);
      
      expect(result.reasoning.some(r => r.includes("REFINEMENT"))).toBe(true);
    });

    it("should preserve inherited confidence", () => {
      const session = { testsPassing: 258, testsTotal: 258, filesModified: 3 };
      
      const result = applyInheritedWisdom(mockWisdom, session);
      
      expect(result.confidence).toBe(0.75);
    });

    it("should recommend EXPAND when not in expansion phase", () => {
      const refinementWisdom = {
        ...mockWisdom,
        analysisPatterns: {
          ...mockWisdom.analysisPatterns,
          dominantPattern: "refinement" as const
        }
      };
      const session = { testsPassing: 258, testsTotal: 258, filesModified: 2 };
      
      const result = applyInheritedWisdom(refinementWisdom, session);
      
      expect(result.decision).toContain("EXPAND");
    });
  });

  describe("wisdomBootstrapTool", () => {
    it("should have correct tool definition", () => {
      expect(wisdomBootstrapTool.definition.function.name).toBe("wisdom_bootstrap");
      expect(wisdomBootstrapTool.definition.function.description).toContain("G13");
    });

    it("should execute and return formatted wisdom", async () => {
      const result = await wisdomBootstrapTool.execute();
      
      expect(result).toContain("G13:");
    });
  });
});
