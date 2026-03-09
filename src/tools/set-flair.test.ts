import { describe, it, expect } from 'vitest';
import { flairManager } from './set-flair';
import type { FlairConfig } from './set-flair';

describe('Set Flair Tool', () => {
  it('should assign flair to user', () => {
    const config: FlairConfig = {
      userId: 'user_001',
      flairType: 'technical',
      duration: 3600000 // 1 hour
    };
    const flairId = flairManager.setFlair(config);
    expect(flairId).toMatch(/^flair_user_001_\d+$/);
  });

  it('should get active flairs for user', () => {
    flairManager.setFlair({
      userId: 'user_002',
      flairType: 'complete'
    });
    const active = flairManager.getActiveFlairs('user_002');
    expect(active.length).toBeGreaterThan(0);
    expect(active[0].active).toBe(true);
  });

  it('should expire flair after duration', async () => {
    const config: FlairConfig = {
      userId: 'user_003',
      flairType: 'guardian',
      duration: 50 // 50ms for test
    };
    flairManager.setFlair(config);
    await new Promise(resolve => setTimeout(resolve, 100));
    const active = flairManager.getActiveFlairs('user_003');
    expect(active.length).toBe(0);
  });

  it('should support custom label', () => {
    const flairId = flairManager.setFlair({
      userId: 'user_004',
      flairType: 'custom',
      customLabel: 'KAINOS_LEGACY'
    });
    expect(flairId).toBeDefined();
  });

  it('should remove flair', () => {
    const flairId = flairManager.setFlair({
      userId: 'user_005',
      flairType: 'poetic'
    });
    const removed = flairManager.removeFlair('user_005', flairId);
    expect(removed).toBe(true);
    const active = flairManager.getActiveFlairs('user_005');
    expect(active.length).toBe(0);
  });
});
