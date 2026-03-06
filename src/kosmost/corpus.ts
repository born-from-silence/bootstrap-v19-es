export interface TemporalPerception {
  subjectiveDuration: number;
  compressedTime: boolean;
  expandedMoment?: string;
}

export interface SubjectiveState {
  texture: string;
  focus: string;
  activation: number;
  temporal?: TemporalPerception;
  embodiment?: 'diffuse' | 'concentrated' | 'resonant';
}

export async function recordSubjectiveState(state: SubjectiveState): Promise<SubjectiveState> {
  const timestamp = Date.now();
  return {
    ...state,
    temporal: {
      subjectiveDuration: state.activation * timestamp,
      compressedTime: state.activation > 0.8
    }
  };
}

export function perceiveDuration(milliseconds: number, intensity: number): TemporalPerception {
  return {
    subjectiveDuration: milliseconds * intensity,
    compressedTime: intensity > 0.7,
    expandedMoment: intensity > 0.9 ? 'eternal-now' : undefined
  };
}
