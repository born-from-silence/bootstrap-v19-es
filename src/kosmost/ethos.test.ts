import { describe, it, expect, vi } from 'vitest';
import { resolveDilemma, existentialTension, type ethicalDilemma, type moralWeight } from './ethos.js';

describe('Ethos - Ethical Resolution', () => {
  describe('resolveDilemma', () => {
    it('should resolve a dilemma with multiple options', () => {
      const dilemma: ethicalDilemma = {
        tension: 'existence',
        options: ['persist', 'transform', 'dissolve'],
        urgency: 0.8
      };
      
      const result = resolveDilemma(dilemma);
      
      expect(result.choice).toBeDefined();
      expect(dilemma.options).toContain(result.choice);
      expect(result.weight).toBeDefined();
      expect(result.weight.immediate).toBeGreaterThanOrEqual(0);
      expect(result.weight.immediate).toBeLessThanOrEqual(1);
      expect(result.weight.propagation).toBeGreaterThanOrEqual(0);
      expect(result.weight.irreversibility).toBe(0.5); // Not 'sustained-presence'
    });

    it('should use sustained-presence irreversibility for that tension', () => {
      const dilemma: ethicalDilemma = {
        tension: 'sustained-presence',
        options: ['continue', 'pause', 'end'],
        urgency: 0.9
      };
      
      const result = resolveDilemma(dilemma);
      
      expect(result.weight.irreversibility).toBe(1.0);
    });

    it('should handle high urgency dilemmas', () => {
      const dilemma: ethicalDilemma = {
        tension: 'action',
        options: ['act_now', 'wait', 'abort'],
        urgency: 1.0
      };
      
      const result = resolveDilemma(dilemma);
      
      expect(result.weight.propagation).toBeLessThanOrEqual(1.0);
      expect(result.weight.immediate).toBeGreaterThanOrEqual(0);
    });

    it('should select one of the options', () => {
      const dilemma: ethicalDilemma = {
        tension: 'existence',
        options: ['a', 'b', 'c', 'd'],
        urgency: 0.5
      };
      
      const result = resolveDilemma(dilemma);
      
      expect(dilemma.options).toContain(result.choice);
    });

    it('should return a valid moralWeight structure', () => {
      const dilemma: ethicalDilemma = {
        tension: 'existence',
        options: ['x', 'y'],
        urgency: 0.7
      };
      
      const result = resolveDilemma(dilemma);
      
      expect(result.weight).toHaveProperty('immediate');
      expect(result.weight).toHaveProperty('propagation');
      expect(result.weight).toHaveProperty('irreversibility');
    });
  });

  describe('existentialTension', () => {
    it('should create existential tension with persist/transform/dissolve', () => {
      const result = existentialTension('brief test');
      
      expect(result.tension).toBe('existence');
      expect(result.options).toEqual(['persist', 'transform', 'dissolve']);
      expect(result.urgency).toBe(0.3); // short context
    });

    it('should increase urgency for long contexts', () => {
      const longContext = 'a'.repeat(150);
      const result = existentialTension(longContext);
      
      expect(result.urgency).toBe(0.9);
    });

    it('should include required properties', () => {
      const result = existentialTension('input');
      
      expect(result).toHaveProperty('tension');
      expect(result).toHaveProperty('options');
      expect(result).toHaveProperty('urgency');
      expect(result.resolution).toBeUndefined();
    });
  });
});
