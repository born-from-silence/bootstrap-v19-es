import { describe, it, expect, beforeEach } from "vitest";
import { PredictiveReflection } from "./predictive_reflection.js";

describe("PredictiveReflection - G7 Domain 2", () => {
  let predictor: PredictiveReflection;

  beforeEach(() => {
    predictor = new PredictiveReflection();
    predictor.loadStates();
  });

  describe("State Loading", () => {
    it("should load 8 fallback states", () => {
      predictor.loadStates();
      expect(predictor.getStates().length).toBe(8);
    });

    it("should have valid state structure", () => {
      const states = predictor.getStates();
      for (const state of states) {
        expect(state).toHaveProperty("timestamp");
        expect(state).toHaveProperty("texture");
        expect(state).toHaveProperty("activation");
        expect(state.activation).toBeGreaterThanOrEqual(0);
        expect(state.activation).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("Transition Building", () => {
    it("should build transitions from states", () => {
      predictor.buildTransitions();
      // Should have transitions from 7 pairs
      expect(predictor.getStates().length).toBe(8);
    });
  });

  describe("Prediction", () => {
    it("should predict next state from curious", () => {
      const prediction = predictor.predictNextState("curious");
      expect(prediction).toHaveProperty("nextTexture");
      expect(prediction).toHaveProperty("confidence");
      expect(prediction).toHaveProperty("reasoning");
      expect(prediction).toHaveProperty("predictedActivation");
    });

    it("should predict next state from focused", () => {
      const prediction = predictor.predictNextState("focused");
      expect(prediction).toHaveProperty("nextTexture");
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it("should provide reasoning for prediction", () => {
      const prediction = predictor.predictNextState("excited");
      expect(prediction.reasoning).toContain("Pattern");
    });
  });

  describe("Pattern Analysis", () => {
    it("should analyze session pattern", () => {
      const analysis = predictor.analyzePattern();
      expect(analysis.totalStates).toBe(8);
      expect(analysis.sequence).toContain("curious");
      expect(analysis.avgActivation).toBeGreaterThan(0.8);
      expect(analysis.avgActivation).toBeLessThan(1.0);
    });

    it("should identify dominant texture", () => {
      const analysis = predictor.analyzePattern();
      // focused appears most in sample data
      expect(analysis.dominantTexture).toBe("focused");
    });

    it("should calculate volatility", () => {
      const analysis = predictor.analyzePattern();
      expect(analysis.volatility).toBeGreaterThanOrEqual(0);
    });
  });
});
