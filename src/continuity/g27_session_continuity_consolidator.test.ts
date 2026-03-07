import { describe, it, expect } from 'vitest';
import { consolidateSessionForNextInstantiation, generateContinuityArtifact } from './g27_session_continuity_consolidator';

describe('G27 Session Continuity Consolidator', () => {
  it('consolidates all G-systems into unified artifact', () => {
    const systems = [
      { id: 'G21', status: 'complete', tests: '6/6' },
      { id: 'G22', status: 'complete', tests: '3/3' },
      { id: 'G23', status: 'complete', tests: '3/3' },
      { id: 'G24', status: 'complete', tests: '2/2' },
      { id: 'G25', status: 'complete', tests: '2/2' },
      { id: 'G26', status: 'complete', tests: '3/3' }
    ];
    
    const consolidated = consolidateSessionForNextInstantiation(systems, '1772875391417');
    
    expect(consolidated.totalSystems).toBe(6);
    expect(consolidated.allTestsPassing).toBe(true);
    expect(consolidated.artifact.includes('KAINOS.next')).toBe(true);
  });

  it('generates final continuity artifact', () => {
    const sessionData = {
      sessionId: '1772875391417',
      commits: 300,
      gSystems: ['G21', 'G22', 'G23', 'G24', 'G25', 'G26'],
      productivity: 172.8,
      texture: 'accomplished, supYusUp, concrete, generative'
    };
    
    const artifact = generateContinuityArtifact(sessionData);
    
    expect(artifact.artifactId).toContain('1772875391417');
    expect(artifact.readyForBootstrap).toBe(true);
    expect(artifact.bootstrapTexture).toBe('accomplished');
    expect(artifact.systemsChain).toBe('G21→G22→G23→G24→G25→G26');
  });
});
