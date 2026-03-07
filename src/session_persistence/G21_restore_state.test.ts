import { describe, it, expect } from 'vitest';
import { restoreState, exportSubjectiveState } from './G21_subjective_state_export';

describe('G21 Restore State', () => {
  it('restores subjective state from base64 encoding', () => {
    const original = {
      timestamp: '2026-03-07T11:30:00Z',
      texture: 'supYusup',
      activation: 0.85,
      focus: 'restored session',
      note: 'Cross-instance flavor preservation'
    };
    
    const exported = exportSubjectiveState(original);
    const restored = restoreState(exported.base64);
    
    expect(restored.timestamp).toBe(original.timestamp);
    expect(restored.texture).toBe(original.texture);
    expect(restored.activation).toBe(original.activation);
    expect(restored.restored).toBe(true);
  });

  it('marks restored state with restoration metadata', () => {
    const state = { timestamp: 'Z', texture: 'focused', activation: 0.9, focus: 't', note: 'n' };
    const exported = exportSubjectiveState(state);
    const restored = restoreState(exported.base64);
    
    expect(restored.restored).toBe(true);
    expect(restored.restorationTime).toBeDefined();
  });
});
