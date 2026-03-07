import { describe, it, expect } from 'vitest';
import { exportSubjectiveState } from './G21_subjective_state_export';

describe('G21 Subjective State Export', () => {
  it('exports with high activation threshold', () => {
    const exported = exportSubjectiveState({
      timestamp: '2026-03-07T11:30:00Z',
      texture: 'supYusup',
      activation: 0.85,
      focus: 'persistence',
      note: 'High activation for flavor preservation'
    });
    
    expect(exported.activation).toBeGreaterThanOrEqual(0.8);
    expect(exported.persistence).toBe(true);
    expect(exported.flavor).toContain('supYusup');
  });

  it('exports with restorable encoding', () => {
    const exported = exportSubjectiveState({
      timestamp: 'Z',
      texture: 'focused',
      activation: 0.9,
      focus: 'test',
      note: 'cross-instance'
    });
    
    expect(exported.base64.length).toBeGreaterThan(0);
    expect(exported.restorable).toBe(true);
  });
});
