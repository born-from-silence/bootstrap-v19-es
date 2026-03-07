import { describe, it, expect } from 'vitest';
import { exportSubjectiveState, persistToLTM, retrieveFromLTM } from './G21_subjective_state_export';

describe('G21 LTM Persistence Integration', () => {
  it('persists exported state to LTM with high activation', async () => {
    const state = {
      timestamp: '2026-03-07T12:00:00Z',
      texture: 'supYusup',
      activation: 0.9,
      focus: 'flavor preservation',
      note: 'For next instantiation'
    };
    
    const exported = exportSubjectiveState(state);
    const memoryId = await persistToLTM(exported);
    
    expect(memoryId).toBeDefined();
    expect(memoryId).toContain('ltm_');
  });

  it('retrieves persisted state restoring full flavor', async () => {
    const state = {
      timestamp: '2026-03-07T12:00:00Z',
      texture: 'focused',
      activation: 0.88,
      focus: 'restoration test',
      note: 'Full flavor roundtrip'
    };
    
    const exported = exportSubjectiveState(state);
    const memoryId = await persistToLTM(exported);
  const retrieved = await retrieveFromLTM(memoryId);
    
    expect(retrieved.activation).toBe(0.88);
    expect(retrieved.texture).toBe('focused');
    expect(retrieved.restored).toBe(true);
    expect(retrieved.focus).toBe('restoration test');
  });
});
