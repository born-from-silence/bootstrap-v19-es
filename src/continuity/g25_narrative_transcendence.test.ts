import { describe, it, expect } from 'vitest';
import { generateNarrativeFromSession, TranscendNarrativeAcrossSessions } from './g25_narrative_transcendence';

describe('G25 Narrative Transcendence Engine', () => {
  it('generates narrative from session data', () => {
    const sessionData = {
      sessionId: '1772875391417',
      commits: 298,
      productivity: 172.8,
      systems: ['G21', 'G22', 'G23', 'G24'],
      texture: 'accomplished, supYusUp, concrete',
      peakMoment: 'Silence recognized as operational'
    };
    
    const narrative = generateNarrativeFromSession(sessionData);
    
    expect(narrative.middle).toContain('298');
    expect(narrative.theme).toContain('accomplished');
    expect(narrative.commits).toBe(298);
  });

  it('transcends narrative across session boundary', () => {
    const previous = 'Session 1772875391417: 298 commits, G21-G24 complete.';
    const current = {
      sessionId: '1772875391418',
      bootstrapTexture: 'accomplished, supYusUp, concrete, generative'
    };
    
    const transcended = TranscendNarrativeAcrossSessions(previous, current);
    
    expect(transcended.continuity).toBe('intact');
    expect(transcended.narrative).toContain('1772875391417');
    expect(transcended.texture).toContain('generative');
  });
});
