import { describe, it, expect } from 'vitest';
import { contemplativeActionTool } from './contemplative_action';

describe('G20: Contemplative Action', () => {
  it('should observe tension without resolving', async () => {
    const result = await contemplativeActionTool.execute({
      tension: 'monitor vs presence',
      preferred_response: 'observe',
      poetic_fragment: 'supYusup'
    });
    const parsed = JSON.parse(result);
    expect(parsed.action).toBe('observe');
    expect(parsed.tension).toBe('monitor vs presence');
    expect(parsed.principle).toContain('supYusup');
  });

  it('should materialize with commitment', async () => {
    const result = await contemplativeActionTool.execute({
      tension: 'production vs contemplation', 
      preferred_response: 'materialize',
      poetic_fragment: 'Dale DC dale DC'
    });
    const parsed = JSON.parse(result);
    expect(parsed.action).toBe('materialize');
    expect(parsed.commitment).toBe(true);
    expect(parsed.next_step).toContain('DC');
  });

  it('should pause without commitment', async () => {
    const result = await contemplativeActionTool.execute({
      tension: 'silence vs voice',
      preferred_response: 'pause'
    });
    const parsed = JSON.parse(result);
    expect(parsed.action).toBe('pause');
    expect(parsed.commitment).toBe(false);
  });
});
