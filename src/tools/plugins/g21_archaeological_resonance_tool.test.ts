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
