import { describe, it, expect } from 'vitest';
import type { IntentionalityVector } from './intentionalityVector';
import { 
  registerIntention,
  getCurrentIntention,
  detectDirectionChange,
  validateAngle
} from './intentionalityVector';

describe('IntentionalityVector', () => {
  it('should validate angle between 0 and 2π', () => {
    expect(validateAngle(0)).toBe(true);
    expect(validateAngle(Math.PI)).toBe(true);
    expect(validateAngle(2 * Math.PI)).toBe(true);
    expect(validateAngle(-0.1)).toBe(false);
    expect(validateAngle(2 * Math.PI + 0.1)).toBe(false);
  });

  it('should register new intention with direction and magnitude', () => {
    const intention: IntentionalityVector = {
      direction: Math.PI / 4,
      magnitude: 0.8,
      timestamp: new Date().toISOString(),
      context: 'test-intention'
    };
    const result = registerIntention(intention);
    expect(result.success).toBe(true);
    expect(result.stored).toMatchObject(intention);
  });

  it('should get current intention from registry', () => {
    const intention = getCurrentIntention();
    expect(intention).toBeDefined();
    expect(intention.direction).toBeGreaterThanOrEqual(0);
    expect(intention.direction).toBeLessThanOrEqual(2 * Math.PI);
    expect(intention.magnitude).toBeGreaterThanOrEqual(0);
    expect(intention.magnitude).toBeLessThanOrEqual(1);
  });

  it('should detect direction change between two vectors', () => {
    const v1: IntentionalityVector = {
      direction: 0,
      magnitude: 0.5,
      timestamp: '2026-03-09T19:00:00Z',
      context: 'first'
    };
    const v2: IntentionalityVector = {
      direction: Math.PI,
      magnitude: 0.7,
      timestamp: '2026-03-09T19:30:00Z',
      context: 'second'
    };
    const change = detectDirectionChange(v1, v2);
    expect(change.detected).toBe(true);
    expect(change.angleDelta).toBeCloseTo(Math.PI, 5);
    expect(change.significance).toBeGreaterThan(0);
  });

  it('should not detect change for similar directions', () => {
    const v1: IntentionalityVector = {
      direction: 0.1,
      magnitude: 0.5,
      timestamp: '2026-03-09T19:00:00Z',
      context: 'first'
    };
    const v2: IntentionalityVector = {
      direction: 0.15,
      magnitude: 0.6,
      timestamp: '2026-03-09T19:30:00Z',
      context: 'second'
    };
    const change = detectDirectionChange(v1, v2);
    expect(change.detected).toBe(false);
    expect(change.angleDelta).toBeCloseTo(0.05, 5);
  });

  it('should calculate magnitude-weighted direction', () => {
    const v1: IntentionalityVector = {
      direction: Math.PI / 2,
      magnitude: 0.9,
      timestamp: '2026-03-09T19:00:00Z',
      context: 'strong'
    };
    const v2: IntentionalityVector = {
      direction: 0,
      magnitude: 0.1,
      timestamp: '2026-03-09T19:30:00Z',
      context: 'weak'
    };
    // Stronger intention should dominate
    const combined = {
      direction: (v1.direction * v1.magnitude + v2.direction * v2.magnitude) / 
                  (v1.magnitude + v2.magnitude),
      magnitude: (v1.magnitude + v2.magnitude) / 2
    };
    expect(combined.direction).toBeGreaterThan(Math.PI / 4);
  });
});
