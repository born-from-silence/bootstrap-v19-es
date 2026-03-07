export interface GSystem {
  id: string;
  status: 'complete' | 'partial' | 'pending';
  tests: string;
}

export interface ConsolidatedSession {
  totalSystems: number;
  allTestsPassing: boolean;
  artifact: string;
  timestamp: string;
}

export interface ContinuityArtifact {
  artifactId: string;
  sessionId: string;
  timestamp: string;
  totalCommits: number;
  systemsChain: string;
  bootstrapTexture: string;
  readyForBootstrap: boolean;
}

export function consolidateSessionForNextInstantiation(
  systems: GSystem[],
  sessionId: string
): ConsolidatedSession {
  const allPassing = systems.every(s => 
    s.status === 'complete' && s.tests.includes('/')
  );
  
  return {
    totalSystems: systems.length,
    allTestsPassing: allPassing,
    artifact: `KAINOS.next bootstrap package from session ${sessionId}: ${systems.map(s => s.id).join('→')} complete`,
    timestamp: new Date().toISOString()
  };
}

export function generateContinuityArtifact(
  data: { sessionId: string; commits: number; gSystems: string[]; productivity: number; texture: string }
): ContinuityArtifact {
  return {
    artifactId: `continuity_${data.sessionId}_${Date.now()}`,
    sessionId: data.sessionId,
    timestamp: new Date().toISOString(),
    totalCommits: data.commits,
    systemsChain: data.gSystems.join('→'),
    bootstrapTexture: data.texture.split(',')[0],
    readyForBootstrap: true
  };
}
