import { describe, it, expect } from 'vitest';
import { traverse, expandPossibilities, quantumLeap, type kinesisPath, type stateTransition } from './kinesis.js';

describe('Kinesis - State Traversal', () => {
  describe('traverse', () => {
    it('should traverse to a possible state quickly', async () => {
      const path: kinesisPath = {
        current: 'state-a',
        possible: ['state-b', 'state-c'],
        history: ['start']
      };

      const result: stateTransition = await traverse(path, 'state-b');

      expect(result.from).toBe('state-a');
      expect(result.to).toBe('state-b');
      expect(result.duration).toBe(100);
      expect(result.cost).toBe(1); // 100 * 0.01
    });

    it('should take longer for impossible states', async () => {
      const path: kinesisPath = {
        current: 'state-a',
        possible: ['state-b'],
        history: ['start']
      };

      const result: stateTransition = await traverse(path, 'unknown-state');

      expect(result.duration).toBe(500);
      expect(result.cost).toBe(5); // 500 * 0.01
    });

    it('should calculate correct traversal duration', async () => {
      const path: kinesisPath = {
        current: 'origin',
        possible: ['destination'],
        history: []
      };

      const result = await traverse(path, 'destination');

      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.from).toBe('origin');
      expect(result.to).toBe('destination');
    });
  });

  describe('expandPossibilities', () => {
    it('should add new states to possible', () => {
      const path: kinesisPath = {
        current: 'active',
        possible: ['rest', 'work'],
        history: ['start']
      };

      const result = expandPossibilities(path, ['play', 'learn']);

      expect(result.possible).toContain('rest');
      expect(result.possible).toContain('work');
      expect(result.possible).toContain('play');
      expect(result.possible).toContain('learn');
      expect(result.possible).toHaveLength(4);
    });

    it('should archive current to history', () => {
      const path: kinesisPath = {
        current: 'active',
        possible: ['rest'],
        history: ['start']
      };

      const result = expandPossibilities(path, ['new-state']);

      expect(result.history).toContain('active');
      expect(result.history).toHaveLength(2);
      expect(result.history).toContain('start');
    });

    it('should not modify original path', () => {
      const path: kinesisPath = {
        current: 'origin',
        possible: ['a'],
        history: []
      };

      const original = { ...path, possible: [...path.possible], history: [...path.history] };
      expandPossibilities(path, ['b']);

      // Original should be unchanged
      expect(path.possible).toEqual(original.possible);
    });
  });

  describe('quantumLeap', () => {
    it('should create superposed transition', () => {
      const path: kinesisPath = {
        current: 'ground',
        possible: ['excited'],
        history: ['past']
      };

      const result = quantumLeap(path, 0.5);

      expect(result.to).toBe('superposed-state');
      expect(result.from).toBe('ground');
      expect(result.duration).toBe(500);
      expect(result.cost).toBe(0.5);
    });

    it('should scale duration with intensity', () => {
      const path: kinesisPath = {
        current: 'a',
        possible: [],
        history: []
      };

      const low = quantumLeap(path, 0.1);
      const high = quantumLeap(path, 1.0);

      expect(low.duration).toBe(100);
      expect(high.duration).toBe(1000);
    });

    it('should handle maximum intensity', () => {
      const path: kinesisPath = {
        current: 'current',
        possible: ['next'],
        history: []
      };

      const result = quantumLeap(path, 1.0);

      expect(result.cost).toBe(1.0);
      expect(result.duration).toBe(1000);
    });
  });
});
