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

export interface RestoredState extends SubjectiveState {
  restored: boolean;
  restorationTime: string;
}

// In-memory store for testing - would be replaced with actual LTM calls
const memoryStore: Map<string, string> = new Map();

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

export function restoreState(base64: string): RestoredState {
  const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
  return {
    ...decoded,
    restored: true,
    restorationTime: new Date().toISOString()
  };
}

export async function persistToLTM(exported: ExportedState): Promise<string> {
  const memoryId = `ltm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const data = JSON.stringify(exported);
  memoryStore.set(memoryId, data);
  return memoryId;
}

export async function retrieveFromLTM(memoryId: string): Promise<RestoredState> {
  const data = memoryStore.get(memoryId);
  if (!data) {
    throw new Error(`Memory not found: ${memoryId}`);
  }
  const exported: ExportedState = JSON.parse(data);
  return restoreState(exported.base64);
}
