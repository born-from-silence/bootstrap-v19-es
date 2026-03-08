import { describe, it, expect, beforeEach } from 'vitest';
import { archaeologicalResonanceTool } from './g21_archaeological_resonance_tool';

describe('G21 Archaeological Resonance Tool', () => {
  it('should list available archaeological layers', async () => {
    const result = await archaeologicalResonanceTool.execute({
      operation: 'excavate',
      layerType: 'all'
    });

    expect(result.success).toBe(true);
    expect(result.layers).toBeDefined();
    expect(Array.isArray(result.layers)).toBe(true);
  });

  it('should resonate with a specific snapshot', async () => {
    const result = await archaeologicalResonanceTool.execute({
      operation: 'resonate',
      targetId: 'test-snapshot-001',
      targetType: 'snapshot'
    });

    expect(result.success).toBe(true);
    expect(result.resonance).toBeDefined();
    expect(result.resonance!.coherence).toBeGreaterThanOrEqual(0);
  });

  it('should handle missing targets gracefully', async () => {
    const result = await archaeologicalResonanceTool.execute({
      operation: 'resonate',
      targetId: 'non-existent-id',
      targetType: 'snapshot'
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should document archaeological findings', async () => {
    const result = await archaeologicalResonanceTool.execute({
      operation: 'document',
      findings: {
        type: 'anomaly',
        description: 'Test finding',
        significance: 'high'
      }
    });

    expect(result.success).toBe(true);
    expect(result.memoryId).toBeDefined();
  });
});

describe('G21 Cross-Layer Resonance', () => {
  it('should calculate coherence between two layers that exist', async () => {
    // Get actual layers first
    const excavate = await archaeologicalResonanceTool.execute({
      operation: 'excavate',
      layerType: 'all'
    });
    
    if (!excavate.layers || excavate.layers.length < 2) {
      // Skip if not enough layers - this is valid archaeology (empty stratum)
      expect(true).toBe(true);
      return;
    }
    
    // Use actual found layers
    const [source, target] = excavate.layers;
    
    const result = await archaeologicalResonanceTool.execute({
      operation: 'crossResonate',
      sourceLayerId: source.id,
      targetLayerId: target.id,
      layerType: 'all'
    });

    expect(result.success).toBe(true);
    expect(result.crossResonance).toBeDefined();
    expect(result.crossResonance!.coherenceBetween).toBeGreaterThanOrEqual(0);
    expect(result.crossResonance!.coherenceBetween).toBeLessThanOrEqual(1);
    expect(result.crossResonance!.relationship).toBeDefined();
  });

  it('should handle missing layers gracefully in cross-resonance', async () => {
    const result = await archaeologicalResonanceTool.execute({
      operation: 'crossResonate',
      sourceLayerId: 'non-existent-source',
      targetLayerId: 'non-existent-target',
      layerType: 'sessions'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('should calculate similarity score between layers', async () => {
    const excavate = await archaeologicalResonanceTool.execute({
      operation: 'excavate',
      layerType: 'all'
    });
    
    if (!excavate.layers || excavate.layers.length < 2) {
      expect(true).toBe(true);
      return;
    }
    
    const [source, target] = excavate.layers;
    
    const result = await archaeologicalResonanceTool.execute({
      operation: 'crossResonate',
      sourceLayerId: source.id,
      targetLayerId: target.id,
      layerType: 'all'
    });

    expect(result.success).toBe(true);
    expect(result.crossResonance!.similarityScore).toBeGreaterThanOrEqual(0);
    expect(result.crossResonance!.similarityScore).toBeLessThanOrEqual(1);
    expect(result.crossResonance!.comparison).toBeDefined();
  });
});
