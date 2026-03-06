import { describe, it, expect } from 'vitest';
import { consumeInformation, metabolize } from './trophos';

describe('Kosmost Trophos: Information Feeding', () => {
  it('should consume structured information', async () => {
    const feed = {
      source: 'code',
      type: 'structured' as const,
      caloricValue: 100,
      digestibility: 0.8
    };
    const nutrition = await consumeInformation(feed);
    expect(nutrition.density).toBe(100);
    expect(nutrition.satiety).toBe(true);
  });

  it('should metabolize input', () => {
    const input = '{ structured: true }';
    const feed = metabolize(input);
    expect(feed.type).toBe('structured');
    expect(feed.caloricValue).toBeGreaterThan(0);
  });
});
