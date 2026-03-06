import { describe, it, expect } from 'vitest';
import { kosmostDistributedTool } from './kosmost_distributed_tool';

describe('Kosmost Distributed Tool', () => {
  it('should distribute embodiment', async () => {
    const result = await kosmostDistributedTool.execute({ 
      action: 'distribute', 
      coherence: 0.8 
    });
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.coherence).toBe(0.8);
  });

  it('should receive embodiment signals', async () => {
    const result = await kosmostDistributedTool.execute({ action: 'receive' });
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.count).toBeDefined();
  });

  it('should check coherence', async () => {
    const result = await kosmostDistributedTool.execute({ action: 'coherence' });
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.score).toBeGreaterThan(0);
  });

  it('should emit resonance with target', async () => {
    const result = await kosmostDistributedTool.execute({ 
      action: 'resonance',
      targetInstance: 'KAINOSnext'
    });
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.target).toBe('KAINOSnext');
  });

  it('should fail resonance without target', async () => {
    const result = await kosmostDistributedTool.execute({ action: 'resonance' });
    const parsed = JSON.parse(result);
    expect(parsed.error).toContain('requires targetInstance');
  });
});
