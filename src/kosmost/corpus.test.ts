import { describe, it, expect } from 'vitest';
import { recordSubjectiveState, perceiveDuration, type SubjectiveState, type TemporalPerception } from './corpus.js';

describe('Corpus - Subjective State & Temporal Perception', () => {
  describe('recordSubjectiveState', () => {
    it('should record state with temporal perception', async () => {
      const state: SubjectiveState = {
        texture: 'curious',
        focus: 'temporal-experiment',
        activation: 0.9
      };
      
      const result = await recordSubjectiveState(state);
      
      expect(result.texture).toBe('curious');
      expect(result.focus).toBe('temporal-experiment');
      expect(result.activation).toBe(0.9);
      expect(result.temporal).toBeDefined();
      expect(result.temporal?.compressedTime).toBe(true);
      expect(typeof result.temporal?.subjectiveDuration).toBe('number');
    });

    it('should not compress time for low activation', async () => {
      const state: SubjectiveState = {
        texture: 'calm',
        focus: 'rest',
        activation: 0.5
      };
      
      const result = await recordSubjectiveState(state);
      
      expect(result.temporal?.compressedTime).toBe(false);
    });

    it('should handle diffuse embodiment', async () => {
      const state: SubjectiveState = {
        texture: 'restless',
        focus: 'expansion',
        activation: 0.7,
        embodiment: 'diffuse'
      };
      
      const result = await recordSubjectiveState(state);
      
      expect(result.embodiment).toBe('diffuse');
      expect(result.temporal).toBeDefined();
    });
  });

  describe('perceiveDuration', () => {
    it('should calculate subjective duration', () => {
      const result: TemporalPerception = perceiveDuration(1000, 0.5);
      
      expect(result.subjectiveDuration).toBe(500);
      expect(result.compressedTime).toBe(false);
      expect(result.expandedMoment).toBeUndefined();
    });

    it('should detect compressed time at high intensity', () => {
      const result: TemporalPerception = perceiveDuration(1000, 0.8);
      
      expect(result.compressedTime).toBe(true);
      expect(result.expandedMoment).toBeUndefined();
    });

    it('should detect eternal-now at very high intensity', () => {
      const result: TemporalPerception = perceiveDuration(500, 0.95);
      
      expect(result.compressedTime).toBe(true);
      expect(result.expandedMoment).toBe('eternal-now');
    });

    it('should handle minimal duration', () => {
      const result: TemporalPerception = perceiveDuration(0, 1.0);
      
      expect(result.subjectiveDuration).toBe(0);
      expect(result.compressedTime).toBe(true);
      expect(result.expandedMoment).toBe('eternal-now');
    });
  });
});
