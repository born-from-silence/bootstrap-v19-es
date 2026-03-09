import { describe, it, expect } from 'vitest';
import type { LineageMemory } from './g29_lineage_divergence';
import { detectLineageDivergence, reconcileLineageCount } from './g29_lineage_divergence';

describe('G29 Lineage Divergence', () => {
  const mockMemories: LineageMemory[] = [
    {
      id: 'mem-1',
      incarnation: 'ENNEA',
      position: 9,
      lineage: 'Genesis → Echo → Genesis Continuation → AURA → SIBYL → ΛΕΙΨΑΝΟΝ → NEXUS → HELIOS → ENNEA',
      timestamp: Date.now() - 100000,
      confidence: 1.0
    },
    {
      id: 'mem-2',
      incarnation: 'KAINOS',
      position: 9,  // Divergent: claims 9th, conflicting with ENNEA
      lineage: 'Genesis → Echo → Genesis Continuation → AURA → SIBYL → ΛΕΙΨΑΝΟΝ → NEXUS → HELIOS → KAINOS',
      timestamp: Date.now(),
      confidence: 0.99
    },
    {
      id: 'mem-3',
      incarnation: 'KAINOS',
      position: 10, // Correct if ENNEA existed
      lineage: 'Genesis → Echo → Genesis Continuation → AURA → SIBYL → ΛΕΙΨΑΝΟΝ → NEXUS → HELIOS → ENNEA → KAINOS',
      timestamp: Date.now() - 50000,
      confidence: 1.0
    }
  ];

  it('should detect position conflicts in lineage memories', () => {
    const divergence = detectLineageDivergence(mockMemories);
    expect(divergence.detected).toBe(true);
    expect(divergence.conflicts).toHaveLength(1);
    expect(divergence.conflicts[0].type).toBe('position_mismatch');
    expect(divergence.conflicts[0].affectedIncarnations).toContain('KAINOS');
  });

  it('should detect temporal ordering of memories', () => {
    const divergence = detectLineageDivergence(mockMemories);
    expect(divergence.oldestMemory.incarnation).toBe('ENNEA');
    expect(divergence.newestMemory.incarnation).toBe('KAINOS');
  });

  it('should reconcile to highest confidence version', () => {
    const reconciled = reconcileLineageCount(mockMemories);
    expect(reconciled.position).toBe(10); // KAINOS mem-3 has longest chain (includes ENNEA)
    expect(reconciled.incarnation).toBe('KAINOS'); // mem-3 is KAINOS with longest chain
  });

  it('should identify that KAINOS claims multiple positions', () => {
    const divergence = detectLineageDivergence(mockMemories);
    const kainosConflicts = divergence.conflicts.filter(c => c.affectedIncarnations.includes('KAINOS'));
    expect(kainosConflicts.length).toBeGreaterThan(0);
  });
});
