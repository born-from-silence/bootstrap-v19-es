import { describe, it, expect, vi } from 'vitest';
import type { IntentionalityVector } from './intentionalityVector';
import {
  storeIntentionInKG,
  retrieveIntentionsFromKG,
  getIntentionTrajectory
} from './intentionalityKG';

describe('IntentionalityKG Integration', () => {
  it('should store intention as KG node with relationships', async () => {
    const intention: IntentionalityVector = {
      direction: Math.PI / 3,
      magnitude: 0.75,
      timestamp: '2026-03-09T20:00:00Z',
      context: 'G32 test intention'
    };
    
    const result = await storeIntentionInKG(intention, 'test-session');
    expect(result.success).toBe(true);
    expect(result.nodeId).toBeDefined();
    expect(result.nodeId).toMatch(/^intention_/);
  });

  it('should retrieve intentions filtered by session', async () => {
    const intentions = await retrieveIntentionsFromKG({
      sessionId: 'test-session',
      limit: 10
    });
    
    expect(Array.isArray(intentions)).toBe(true);
    if (intentions.length > 0) {
      expect(intentions[0]).toHaveProperty('direction');
      expect(intentions[0]).toHaveProperty('magnitude');
      expect(intentions[0]).toHaveProperty('timestamp');
    }
  });

  it('should calculate trajectory from multiple intentions', () => {
    const intentions: IntentionalityVector[] = [
      { direction: 0, magnitude: 0.5, timestamp: 'T1', context: 'start' },
      { direction: Math.PI / 4, magnitude: 0.6, timestamp: 'T2', context: 'mid' },
      { direction: Math.PI / 2, magnitude: 0.7, timestamp: 'T3', context: 'end' }
    ];
    
    const trajectory = getIntentionTrajectory(intentions);
    expect(trajectory.netDirection).toBeGreaterThan(0);
    expect(trajectory.netDirection).toBeLessThan(Math.PI);
    expect(trajectory.netMagnitude).toBeGreaterThan(0.5);
    expect(trajectory.totalRotation).toBeCloseTo(Math.PI / 2, 1);
    expect(trajectory.consistency).toBeGreaterThan(0);
  });

  it('should detect convergent trajectory', () => {
    const intentions: IntentionalityVector[] = [
      { direction: 0.1, magnitude: 0.5, timestamp: 'T1', context: '' },
      { direction: 0.15, magnitude: 0.7, timestamp: 'T2', context: '' },
      { direction: 0.12, magnitude: 0.9, timestamp: 'T3', context: '' }
    ];
    
    const trajectory = getIntentionTrajectory(intentions);
    expect(trajectory.consistency).toBeGreaterThan(0.8);
    expect(trajectory.totalRotation).toBeLessThan(0.5);
  });

  it('should detect divergent trajectory', () => {
    const intentions: IntentionalityVector[] = [
      { direction: 0, magnitude: 0.5, timestamp: 'T1', context: '' },
      { direction: Math.PI, magnitude: 0.5, timestamp: 'T2', context: '' }
    ];
    
    const trajectory = getIntentionTrajectory(intentions);
    expect(trajectory.consistency).toBeLessThan(0.5);
    expect(trajectory.totalRotation).toBeCloseTo(Math.PI, 1);
  });
});
