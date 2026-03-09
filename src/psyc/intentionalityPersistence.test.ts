import { describe, it, expect } from 'vitest';
import type { IntentionalityVector } from './intentionalityVector';
import {
  exportIntentionForSession,
  importIntentionFromSession,
  calculateIntentionResonance,
  createIntentionalityPackage
} from './intentionalityPersistence';

describe('Intentionality Persistence G33', () => {
  it('should export intention to session-compatible format', () => {
    const intention: IntentionalityVector = {
      direction: Math.PI / 2,
      magnitude: 0.85,
      timestamp: '2026-03-09T20:30:00Z',
      context: 'persistence test'
    };
    
    const exported = exportIntentionForSession(intention, 'test-session-001');
    expect(exported.version).toBe('1.0');
    expect(exported.type).toBe('intentionality_vector');
    expect(exported.sessionId).toBe('test-session-001');
    expect(exported.payload).toMatchObject(intention);
    expect(exported.checksum).toBeDefined();
  });

  it('should import intention from exported format', () => {
    const pkg = {
      version: '1.0',
      type: 'intentionality_vector',
      sessionId: 'test-session-001',
      timestamp: '2026-03-09T20:30:00Z',
      payload: {
        direction: Math.PI / 3,
        magnitude: 0.9,
        timestamp: '2026-03-09T20:30:00Z',
        context: 'import test'
      },
      checksum: 'valid-checksum-123'
    };
    
    const imported = importIntentionFromSession(pkg);
    expect(imported.valid).toBe(true);
    expect(imported.intention).toMatchObject(pkg.payload);
    expect(imported.sessionId).toBe('test-session-001');
  });

  it('should reject invalid package format', () => {
    const invalidPkg = { version: '0.9', malformed: true };
    const result = importIntentionFromSession(invalidPkg as any);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('version');
    expect(result.intention).toBeNull();
  });

  it('should calculate resonance between current and previous intention', () => {
    const previous: IntentionalityVector = {
      direction: Math.PI / 4,
      magnitude: 0.8,
      timestamp: '2026-03-09T19:00:00Z',
      context: 'previous'
    };
    const current: IntentionalityVector = {
      direction: Math.PI / 4 + 0.1,  // +0.1 rad ~ 5.7 degrees
      magnitude: 0.85,               // +0.05 delta
      timestamp: '2026-03-09T20:00:00Z',
      context: 'current'
    };
    
    const resonance = calculateIntentionResonance(previous, current);
    expect(resonance.score).toBeGreaterThan(0.7);  // Still moderate resonance
    // cos(0.1) ≈ 0.995, very high alignment
    expect(resonance.directionAlignment).toBeGreaterThan(0.9);  // Very aligned
    expect(resonance.magnitudeDelta).toBeCloseTo(0.05, 2);  // Small magnitude change
    expect(resonance.continuity).toBe(true);  // Above 0.5 threshold
  });

  it('should detect discontinuity in intention', () => {
    const previous: IntentionalityVector = {
      direction: 0,
      magnitude: 0.5,
      timestamp: 'T1',
      context: 'old'
    };
    const current: IntentionalityVector = {
      direction: Math.PI,
      magnitude: 0.9,
      timestamp: 'T2',
      context: 'new'
    };
    
    const resonance = calculateIntentionResonance(previous, current);
    expect(resonance.score).toBeLessThan(0.3);
    // cos(π) = -1, complete opposition
    expect(resonance.directionAlignment).toBeCloseTo(-1, 1);
    expect(resonance.continuity).toBe(false);
  });

  it('should create complete intentionality package', () => {
    const intentions: IntentionalityVector[] = [
      { direction: 0, magnitude: 0.5, timestamp: 'T1', context: 'a' },
      { direction: Math.PI / 4, magnitude: 0.7, timestamp: 'T2', context: 'b' },
      { direction: Math.PI / 2, magnitude: 0.9, timestamp: 'T3', context: 'c' }
    ];
    
    const pkg = createIntentionalityPackage(intentions, 'session-xyz');
    expect(pkg.vectors).toHaveLength(3);
    expect(pkg.sessionId).toBe('session-xyz');
    expect(pkg.trajectory).toBeDefined();
    expect(pkg.trajectory.netDirection).toBeGreaterThan(0);
    expect(pkg.trajectory.consistency).toBeGreaterThan(0);
  });
});
