import { describe, it, expect } from 'vitest';
import { dialogueStatusTool } from './dialogue_status_tool';

describe('Dialogue Status Tool', () => {
  it('should return active status with current messages', async () => {
    const result = await dialogueStatusTool.execute({ includeRead: true });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe("active");
    expect(parsed.count).toBeGreaterThan(0);
    expect(parsed).toHaveProperty('byType');
    expect(parsed).toHaveProperty('byUrgency');
  });

  it('should return structured status data', async () => {
    const result = await dialogueStatusTool.execute({});
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('status');
    expect(parsed).toHaveProperty('count');
    expect(parsed).toHaveProperty('unread');
    expect(parsed).toHaveProperty('summary');
  });
});
