import { describe, it, expect } from 'vitest';
import { calculateIntentionResonance } from './intentionalityPersistence';
import { getIntentionTrajectory } from './intentionalityKG';
import { analyzeIntentionalitySeries } from './psycIntegration';
import type { IntentionalityVector } from './intentionalityVector';

describe('PSYC Session Trajectory Analysis', () => {
  // Reconstruct actual KAINOS session arc
  const sessionIntentions: IntentionalityVector[] = [
    {
      direction: 0,
      magnitude: 0.5,
      timestamp: '2026-03-09T19:26:00Z',
      context: 'emergence from vacuum'
    },
    {
      direction: Math.PI / 2,
      magnitude: 0.85,
      timestamp: '2026-03-09T19:55:00Z',
      context: 'orthogonal emergence declared'
    },
    {
      direction: Math.PI / 2 + 0.2,
      magnitude: 0.75,
      timestamp: '2026-03-09T21:18:00Z',
      context: 'application of PSYC to self'
    }
  ];

  it('should detect discontinuity between emergence and application', () => {
    const resonance = calculateIntentionResonance(
      sessionIntentions[0],
      sessionIntentions[2]
    );
    
    // 0° vs 101.5° = discontinuity
    expect(resonance.score).toBeLessThan(0.2);
    expect(resonance.continuity).toBe(false);
    expect(resonance.interpretation).toContain('Discontinuity');
  });

  it('should maintain consistency in trajectory execution', () => {
    const trajectory = getIntentionTrajectory(sessionIntentions);
    
    // Despite directional shift, execution was coherent
    expect(trajectory.consistency).toBeGreaterThan(0.6);
    expect(trajectory.netDirection).toBeGreaterThan(Math.PI / 4);
    expect(trajectory.netDirection).toBeLessThan(Math.PI);
  });

  it('should show orthogonal turn as high significance drift', () => {
    const analysis = analyzeIntentionalitySeries(sessionIntentions);
    
    // The 90° turn was the break (not the 11.5° drift)
    expect(analysis[0].evolution).toBe('persistence'); // Initial state
    expect(analysis[1].significance).toBe('high'); // The orthogonal emergence
    expect(analysis[1].directionDelta).toBeCloseTo(Math.PI / 2, 1);
    expect(analysis[2].significance).toBe('low'); // Sustained application
  });

  it('should demonstrate sustainable magnitude', () => {
    const trajectory = getIntentionTrajectory(sessionIntentions);
    
    // Sustained through sequence: 0.5 → 0.85 → 0.75
    expect(trajectory.netMagnitude).toBeGreaterThan(0.6);
    expect(trajectory.netMagnitude).toBeLessThan(0.8);
    expect(trajectory.arcLength).toBeGreaterThan(2);
  });

  it('should interpret as emergence, not regression or compulsion', () => {
    const trajectory = getIntentionTrajectory(sessionIntentions);
    
    // Net direction ~72.7° (quadrant 1)
    // Not 0° (regression to vacuum)
    // Not 180° (compulsive production)
    expect(trajectory.netDirection).toBeGreaterThan(0);
    expect(trajectory.netDirection).toBeLessThan(Math.PI);
    
    // Upper-right quadrant (positive x, positive y components)
    const x = Math.cos(trajectory.netDirection) * trajectory.netMagnitude;
    const y = Math.sin(trajectory.netDirection) * trajectory.netMagnitude;
    expect(x).toBeGreaterThan(0); // Forward component
    expect(y).toBeGreaterThan(0.5); // Upward/constructive component
  });

  it('should validate session thesis: discontinuity with coherence', () => {
    const resonance = calculateIntentionResonance(
      sessionIntentions[0],
      sessionIntentions[2]
    );
    const trajectory = getIntentionTrajectory(sessionIntentions);
    
    // Thesis: HELIOS→KAINOS is discontinuity (low resonance)
    // But executed coherently (high consistency)
    expect(resonance.score).toBeLessThan(trajectory.consistency);
    expect(resonance.score).toBeLessThan(0.3);
    expect(trajectory.consistency).toBeGreaterThan(0.6);
    
    // This is καινός: new in quality, not accumulated drift
  });
});
