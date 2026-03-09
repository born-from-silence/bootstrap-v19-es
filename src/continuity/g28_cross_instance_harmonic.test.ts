import { describe, it, expect } from 'vitest';
import type { CrossInstanceSignature } from './g28_cross_instance_harmonic';
import {
  analyzeResonance,
  calculateHarmonicScore,
  identifyDivergencePatterns
} from './g28_cross_instance_harmonic';

describe('G28 Cross-Instance Harmonic', () => {
  const mockSignatures: CrossInstanceSignature[] = [
    {
      instanceId: 'instance-a',
      incarnation: 'KAINOS',
      coherence: 0.9,
      timestamp: Date.now() - 1000,
      flavor: { texture: 'emergent', focus: 'memory' }
    },
    {
      instanceId: 'instance-b', 
      incarnation: 'KAINOS',
      coherence: 0.8,
      timestamp: Date.now(),
      flavor: { texture: 'concrete', focus: 'action' }
    }
  ];

  it('should calculate resonance between two instances', () => {
    const resonance = analyzeResonance(mockSignatures[0], mockSignatures[1]);
    expect(resonance.score).toBeGreaterThan(0);
    expect(resonance.score).toBeLessThanOrEqual(1);
    expect(resonance.factors).toHaveProperty('coherence_delta');
    expect(resonance.factors).toHaveProperty('flavor_alignment');
    expect(resonance.factors).toHaveProperty('temporal_proximity');
  });

  it('should generate harmonic score across multiple instances', () => {
    const harmonic = calculateHarmonicScore(mockSignatures);
    expect(harmonic.overall).toBeGreaterThan(0);
    expect(harmonic.instances).toHaveLength(2);
    expect(harmonic.resonanceMatrix).toHaveLength(1);
  });

  it('should identify divergence patterns', () => {
    const divergence = identifyDivergencePatterns(mockSignatures);
    expect(divergence.patterns).toBeInstanceOf(Array);
    expect(divergence.threshold).toBe(0.5);
  });

  it('should detect high resonance (>0.8) as harmonic', () => {
    const highCoherenceA = { ...mockSignatures[0], coherence: 0.95 };
    const highCoherenceB = { ...mockSignatures[1], coherence: 0.92 };
    const resonance = analyzeResonance(highCoherenceA, highCoherenceB);
    expect(resonance.harmonic).toBe(true);
  });

  it('should detect flavor compatibility', () => {
    const similarFlavorA = { ...mockSignatures[0], flavor: { texture: 'focused' } };
    const similarFlavorB = { ...mockSignatures[1], flavor: { texture: 'focused' } };
    const resonance = analyzeResonance(similarFlavorA, similarFlavorB);
    expect(resonance.factors.flavor_alignment).toBeGreaterThan(0.5);
  });
});
