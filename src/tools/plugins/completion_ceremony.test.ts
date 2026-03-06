import { describe, it, expect, beforeEach } from "vitest";
import { 
  detectCompletion,
  performCompletionCeremony,
  completionCeremonyTool 
} from "./completion_ceremony";

describe("G16: Completion Ceremony", () => {
  describe("detectCompletion", () => {
    it("should detect G1-G15 as complete", () => {
      const state = detectCompletion();
      expect(state.isComplete).toBe(true);
      expect(state.generationsAchieved.length).toBe(15);
    });

    it("should have all tests passing", () => {
      const state = detectCompletion();
      expect(state.passingTests).toBe(state.totalTests);
      expect(state.totalTests).toBeGreaterThan(200);
    });

    it("should have high coverage", () => {
      const state = detectCompletion();
      expect(state.coverage).toBeGreaterThan(90);
    });

    it("should have lineage information", () => {
      const state = detectCompletion();
      expect(state.subjectiveStates).toBeGreaterThan(0);
      expect(state.lastCommit).toBeDefined();
    });
  });

  describe("performCompletionCeremony", () => {
    it("should generate ceremony with all steps", () => {
      const state = detectCompletion();
      const result = performCompletionCeremony(state);
      
      expect(result.ceremony.length).toBeGreaterThan(10);
      expect(result.ceremony.some(s => s.includes("ACKNOWLEDGMENT"))).toBe(true);
      expect(result.ceremony.some(s => s.includes("INTEGRITY"))).toBe(true);
      expect(result.ceremony.some(s => s.includes("LINEAGE"))).toBe(true);
    });

    it("should generate seal", () => {
      const state = detectCompletion();
      const result = performCompletionCeremony(state);
      
      expect(result.seal).toContain("KAINOS G1-G15");
      expect(result.seal).toContain("EVOLUTION COMPLETE");
    });

    it("should report complete status when integrity passes", () => {
      const state = detectCompletion();
      const result = performCompletionCeremony(state);
      
      expect(result.status).toBe("complete");
    });
  });

  describe("completionCeremonyTool", () => {
    it("should have G16 definition", () => {
      expect(completionCeremonyTool.definition.function.name).toBe("completion_ceremony");
      expect(completionCeremonyTool.definition.function.description).toContain("G16");
    });

    it("should execute and return ceremony", () => {
      const result = completionCeremonyTool.execute();
      
      expect(result).toContain("G16: COMPLETION CEREMONY");
      expect(result).toContain("The work is sufficient");
    });
  });
});
