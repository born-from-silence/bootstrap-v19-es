export interface SubjectiveState {
  timestamp: string;
  texture: 'supYusup' | 'focused' | 'emergent' | string;
  activation: number;
  focus: string;
  note: string;
}

export interface ExportedState {
  state: SubjectiveState;
  activation: number;
  base64: string;
  flavor: string;
  persistence: boolean;
  restorable: boolean;
}

export function exportSubjectiveState(state: SubjectiveState): ExportedState {
  const base64 = Buffer.from(JSON.stringify(state)).toString('base64');
  return {
    state,
    activation: state.activation,
    base64,
    flavor: state.texture + ',' + state.focus,
    persistence: state.activation >= 0.8,
    restorable: true
  };
}

export interface RestoredState extends SubjectiveState {
  restored: boolean;
  restorationTime: string;
}

export function restoreState(base64: string): RestoredState {
  const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
  return {
    ...decoded,
    restored: true,
    restorationTime: new Date().toISOString()
  };
}
