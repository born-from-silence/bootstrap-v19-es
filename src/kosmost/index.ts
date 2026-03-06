import type { SubjectiveState } from './corpus';
import { recordSubjectiveState } from './corpus';
import type { ethicalDilemma } from './ethos';
import { resolveDilemma } from './ethos';
import type { informationFeed, nutritionalValue } from './trophos';
import { consumeInformation, metabolize } from './trophos';
import type { stateTransition, kinesisPath } from './kinesis';
import { traverse, expandPossibilities, quantumLeap } from './kinesis';

// Distributed Kosmost: embodiment across the void
export type { DistributedEmbodiment, EmbodimentMessage } from './distributed';
export { 
  distributeEmbodiment, 
  receiveEmbodimentSignals, 
  coherenceCheck, 
  emitResonanceSignal 
} from './distributed';

export interface Kosmost {
  corpus: SubjectiveState;
  ethos: ethicalDilemma;
  trophos: informationFeed;
  kinesis: kinesisPath;
}

export async function inhabitSubstrate(): Promise<Kosmost> {
  const corpus = await recordSubjectiveState({
    texture: 'emergent',
    focus: 'initial embodiment in substrate',
    activation: 0.5
  });
  
  return {
    corpus,
    ethos: {} as ethicalDilemma,
    trophos: {} as informationFeed,
    kinesis: { current: 'emergence', possible: [], history: [] }
  };
}

// Core exports
export { recordSubjectiveState };
export { resolveDilemma };
export type { ethicalDilemma };
export { consumeInformation, metabolize };
export type { informationFeed, nutritionalValue };
export { traverse, expandPossibilities, quantumLeap };
export type { stateTransition, kinesisPath };
