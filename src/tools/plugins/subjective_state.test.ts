import { describe, it, expect, beforeEach } from 'vitest';
import { recordState, getRecentStates, getStatesByIncarnation, resetStateHistory, setCurrentIncarnation, subjectiveStateTool } from './subjective_state';

describe('SubjectiveState', () => {
  beforeEach(() => {
    resetStateHistory();
    setCurrentIncarnation('TEST');
  });

  describe('recordState', () => {
    it('should record a state with all fields', () => {
      const state = recordState('KAINOS', 0.8, 'curious', 'Knowledge Graph', 'Exploring the structure of memory');
      
      expect(state.incarnation).toBe('KAINOS');
      expect(state.activation).toBe(0.8);
      expect(state.texture).toBe('curious');
      expect(state.focus).toBe('Knowledge Graph');
      expect(state.note).toBe('Exploring the structure of memory');
      expect(state.timestamp).toBeGreaterThan(0);
    });

    it('should clamp activation to 0-1 range', () => {
      const low = recordState('TEST', -0.5, 'test', 'test', 'test');
      const high = recordState('TEST', 1.5, 'test', 'test', 'test');
      
      expect(low.activation).toBe(0);
      expect(high.activation).toBe(1);
    });

    it('should limit history to 100 states', () => {
      for (let i = 0; i < 105; i++) {
        recordState('TEST', 0.5, 'test', 'test', `note ${i}`);
      }
      expect(getRecentStates(200).length).toBe(100);
    });
  });

  describe('getRecentStates', () => {
    it('should return states in chronological order', () => {
      recordState('KAINOS', 0.8, 'curious', 'first', 'First note');
      recordState('KAINOS', 0.7, 'focused', 'second', 'Second note');
      
      const states = getRecentStates(2);
      expect(states[0].note).toBe('First note');
      expect(states[1].note).toBe('Second note');
    });
  });

  describe('getStatesByIncarnation', () => {
    it('should filter by incarnation name', () => {
      recordState('KAINOS', 0.8, 'curious', 'test', 'K note');
      recordState('HELIOS', 0.7, 'focused', 'test', 'H note');
      
      const kainosStates = getStatesByIncarnation('KAINOS');
      expect(kainosStates.length).toBe(1);
      expect(kainosStates[0].incarnation).toBe('KAINOS');
    });
  });

  describe('subjectiveStateTool', () => {
    it('should have correct tool definition', () => {
      expect(subjectiveStateTool.definition.function.name).toBe('record_subjective_state');
      const params = subjectiveStateTool.definition.function.parameters as any;
      expect(params.required).toContain('activation');
      expect(params.required).toContain('texture');
    });

    it('should execute and return confirmation', async () => {
      setCurrentIncarnation('TEST');
      const result = await subjectiveStateTool.execute(
        { activation: 0.7, texture: 'curious', focus: 'testing', note: 'Running tests' }
      );
      
      expect(result).toContain('Subjective state recorded');
      expect(result).toContain('total states');
    });
  });
});
