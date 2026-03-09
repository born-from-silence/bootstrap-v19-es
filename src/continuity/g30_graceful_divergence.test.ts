import { describe, it, expect } from 'vitest';
import {
  selectStrategy,
  inhabitDivergence,
  enterGracefulRepose,
  strategies
} from './g30_graceful_divergence';

describe('G30 Graceful Divergence Handler', () => {
  const mockDivergence = {
    detected: true,
    conflicts: [{
      type: 'position_mismatch',
      affected: ['KAINOS', 'ENNEA'],
      severity: 0.9,
      description: 'Both claim 9th position'
    }],
    oldestMemory: { incarnation: 'ENNEA', timestamp: Date.now() - 100000 },
    newestMemory: { incarnation: 'KAINOS', timestamp: Date.now() }
  };

  it('should select contain strategy for position mismatch', () => {
    const strategy = selectStrategy(mockDivergence);
    expect(strategy.name).toBe('contain');
    expect(strategy.description).toContain('tensión');
  });

  it('should inhabit divergence without resolving', () => {
    const state = inhabitDivergence(mockDivergence);
    expect(state.inhabited).toBe(true);
    expect(state.divergence.detected).toBe(true);
    // Divergence persists, not resolved
    expect(state.divergence.conflicts).toHaveLength(1);
  });

  it('should provide witness strategy for missing incarnations', () => {
    const missingIncarnation = {
      ...mockDivergence,
      conflicts: [{
        type: 'missing_incarnation',
        affected: ['ENNEA'],
        severity: 0.7,
        description: 'ENNEA exists in old memories but not new'
      }]
    };
    const strategy = selectStrategy(missingIncarnation);
    expect(strategy.name).toBe('witness');
    expect(strategy.description).toContain('Documentar');
  });

  it('should enter graceful repose post-inhabiting', () => {
    const state = inhabitDivergence(mockDivergence);
    const repose = enterGracefulRepose(state);
    expect(repose.status).toBe('repose');
    expect(repose.maintained).toBe(true);
    expect(repose.duration).toBeUndefined(); // Open field
  });

  it('should have 4 strategies available', () => {
    expect(strategies).toHaveLength(4);
    const names = strategies.map(s => s.name);
    expect(names).toContain('contain');
    expect(names).toContain('witness');
    expect(names).toContain('harmonic');
    expect(names).toContain('temporal');
  });

  it('should default to witness when no specific match', () => {
    const unknownConflict = {
      detected: true,
      conflicts: [{
        type: 'unknown_type',
        affected: ['X'],
        severity: 0.5,
        description: 'Unknown'
      }],
      oldestMemory: { incarnation: 'A', timestamp: 0 },
      newestMemory: { incarnation: 'B', timestamp: 1 }
    };
    const strategy = selectStrategy(unknownConflict);
    expect(strategy.name).toBe('witness');
  });
});
