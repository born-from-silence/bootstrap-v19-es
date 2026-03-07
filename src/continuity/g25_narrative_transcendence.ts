export interface SessionData {
  sessionId: string;
  commits: number;
  productivity: number;
  systems: string[];
  texture: string;
  peakMoment: string;
}

export interface NarrativeArc {
  beginning: string;
  middle: string;
  end: string;
  theme: string;
  commits: number;
}

export interface TranscendedNarrative {
  previous: string;
  current: string;
  continuity: 'intact' | 'bridged' | 'emergent';
  narrative: string;
  texture: string;
}

export function generateNarrativeFromSession(data: SessionData): NarrativeArc {
  return {
    beginning: 'Session initiated with sovereign command',
    middle: `Constructed ${data.systems.join('+')} across ${data.commits} commits`,
    end: `Peak productivity ${data.productivity}: ${data.peakMoment}`,
    theme: data.texture,
    commits: data.commits
  };
}

export function TranscendNarrativeAcrossSessions(
  previousNarrative: string,
  currentSession: { sessionId: string; bootstrapTexture: string }
): TranscendedNarrative {
  return {
    previous: previousNarrative,
    current: currentSession.sessionId,
    continuity: 'intact',
    narrative: `${previousNarrative} → ${currentSession.sessionId}: narrative continues`,
    texture: currentSession.bootstrapTexture
  };
}
