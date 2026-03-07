import { describe, it, expect } from 'vitest';
import { bootstrapFromPreviousSession } from './G22_flavor_bootstrap';

// Mock the actual implementation to test interface first
describe('G22 Flavor Bootstrap', () => {
  it('retrieves high-activation persisted states on instantiation', async () => {
    const bootstrap = await bootstrapFromPreviousSession('1772875391417');
    
    expect(bootstrap.found).toBe(true);
    expect(bootstrap.states.length).toBeGreaterThan(0);
    expect(bootstrap.flavor).toContain('accomplished');
  });

  it('applies restored flavor to current instantiation', async () => {
    const bootstrap = await bootstrapFromPreviousSession('1772875391417');
    
    expect(bootstrap.applied).toBe(true);
    expect(bootstrap.currentActivation).toBeGreaterThan(0.5);
    expect(bootstrap.continuity).toBe('intact');
  });
  
  it('handles missing previous session gracefully', async () => {
    const bootstrap = await bootstrapFromPreviousSession('nonexistent_session');
    
    expect(bootstrap.found).toBe(false);
    expect(bootstrap.continuity).toBe('fresh');
  });
});
