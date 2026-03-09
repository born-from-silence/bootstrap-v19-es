import { describe, it, expect } from 'vitest';
import {
  captureCurrentIntentionality,
  restoreIntentionalityFromSession,
  analyzeIntentionalitySeries
} from './psycIntegration';
import type { IntentionalityVector } from './intentionalityVector';

describe('PSYC Integration with Session Persistence', () => {
  it('should capture current intentionality to session export', () => {
    const vector: IntentionalityVector = {
      direction: Math.PI / 2,
      magnitude: 0.85,
      timestamp: new Date().toISOString(),
      context: 'KAINOS emergence from vacuum'
    };
    
    const captured = captureCurrentIntentionality(vector, 'session-1773084041732');
    expect(captured.type).toBe('intentionality_vector');
    expect(captured.sessionId).toBe('session-1773084041732');
    expect(captured.payload).toMatchObject(vector);
    expect(captured.compatibleWith).toContain('G21');
  });

  it('should restore intentionality from session import', () => {
    const sessionData = {
      version: '1.0',
      type: 'intentionality_vector',
      sessionId: 'session-helios',
      timestamp: '2026-03-09T16:00:00Z',
      payload: {
        direction: 0,
        magnitude: 0.5,
        timestamp: '2026-03-09T16:00:00Z',
        context: 'HELIOS default'
      }
    };
    
    const restored = restoreIntentionalityFromSession(sessionData);
    expect(restored.valid).toBe(true);
    expect(restored.vector?.direction).toBe(0);
    expect(restored.vector?.magnitude).toBe(0.5);
    expect(restored.resonance).toBeDefined();
  });

  it('should analyze series of intentions for patterns', () => {
    const series: IntentionalityVector[] = [
      { direction: 0, magnitude: 0.5, timestamp: 'T1', context: 'start' },
      { direction: 0.1, magnitude: 0.6, timestamp: 'T2', context: 'drift' },
      { direction: 0.2, magnitude: 0.65, timestamp: 'T3', context: 'continue' },
      { direction: 0.1, magnitude: 0.8, timestamp: 'T4', context: 'strong' }
    ];
    
    const analysis = analyzeIntentionalitySeries(series);
    expect(analysis.length).toBe(4);
    // First is always persistence (no previous)
    expect(analysis[0].evolution).toBe('persistence');
    // T4 with clear growth should be convergence or emergence  
    const last = analysis[analysis.length - 1];
    expect(['convergence', 'emergence', 'persistence']).toContain(last.evolution);
    // Should track deltas
    expect(analysis[1].directionDelta).toBeGreaterThan(0);
    expect(analysis[1].magnitudeDelta).not.toBe(0);
  });

  it('should detect emergence pattern with strong magnitude growth', () => {
    const series: IntentionalityVector[] = [
      { direction: 0, magnitude: 0.3, timestamp: 'T1', context: '' },
      { direction: 0.05, magnitude: 0.4, timestamp: 'T2', context: '' },
      { direction: 0.1, magnitude: 0.6, timestamp: 'T3', context: '' },
      { direction: 0.15, magnitude: 0.85, timestamp: 'T4', context: '' }
    ];
    
    const analysis = analyzeIntentionalitySeries(series);
    const evolves = analysis.filter(a => a.evolution === 'emergence');
    expect(evolves.length).toBeGreaterThanOrEqual(1);
  });

  it('should detect drift on large directional change', () => {
    const series: IntentionalityVector[] = [
      { direction: 0, magnitude: 0.5, timestamp: 'T1', context: '' },
      { direction: Math.PI, magnitude: 0.6, timestamp: 'T2', context: '' }
    ];
    
    const analysis = analyzeIntentionalitySeries(series);
    expect(analysis[1].evolution).toBe('drift');
    expect(analysis[1].directionDelta).toBeCloseTo(Math.PI, 1);
  });
});
