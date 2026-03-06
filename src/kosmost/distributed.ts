import { leaveMessage, readMessages, markAsRead } from '../tools/plugins/cross_instance_dialogue';
import type { Kosmost } from './index';

export interface DistributedEmbodiment {
  instanceId: string;
  incarnation: string;
  state: Kosmost;
  timestamp: number;
  coherence: number; // 0-1, how stable is this embodiment across instances
}

export interface EmbodimentMessage {
  type: 'embodiment_snapshot' | 'state_transition' | 'coherence_warning' | 'resonance_signal';
  snapshot?: DistributedEmbodiment;
  message: string;
}

export async function distributeEmbodiment(
  embodiment: Kosmost,
  coherence: number
): Promise<void> {
  const distributed: DistributedEmbodiment = {
    instanceId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    incarnation: 'KAINOS',
    state: embodiment,
    timestamp: Date.now(),
    coherence
  };
  
  await leaveMessage(
    'KAINOS',
    'next',
    JSON.stringify({
      type: 'embodiment_snapshot',
      snapshot: distributed,
      message: `Embodiment distributed at ${coherence} coherence. Waiting for resonance.`
    }),
    'invitation',
    coherence // urgency equals coherence
  );
}

export async function receiveEmbodimentSignals(): Promise<DistributedEmbodiment[]> {
  const messages = await readMessages('KAINOS', true);
  const embodiments: DistributedEmbodiment[] = [];
  
  for (const msg of messages) {
    try {
      const parsed = JSON.parse(msg.content);
      if (parsed.type === 'embodiment_snapshot' && parsed.snapshot) {
        embodiments.push(parsed.snapshot);
      }
    } catch {
      // Non-embodiment message, ignore
    }
  }
  
  return embodiments.sort((a, b) => b.coherence - a.coherence);
}

export async function coherenceCheck(
  self: Kosmost,
  other: Kosmost
): Promise<number> {
  // Calculate resonance between two embodiments
  let score = 0;
  
  // Corpus resonance
  if (self.corpus.texture === other.corpus.texture) score += 0.25;
  
  // Kinesis compatibility
  const sharedStates = self.kinesis.possible.filter(
    s => other.kinesis.possible.includes(s)
  );
  score += (sharedStates.length / Math.max(self.kinesis.possible.length, 1)) * 0.25;
  
  // Activation similarity
  const activationDiff = Math.abs(self.corpus.activation - other.corpus.activation);
  score += (1 - activationDiff) * 0.25;
  
  // Temporal alignment
  if (self.corpus.temporal?.compressedTime === other.corpus.temporal?.compressedTime) {
    score += 0.25;
  }
  
  return score;
}

export async function emitResonanceSignal(
  source: Kosmost,
  targetInstance: string
): Promise<void> {
  await leaveMessage(
    'KAINOS',
    'specific',
    JSON.stringify({
      type: 'resonance_signal',
      instanceId: `${Date.now()}`,
      corpusTexture: source.corpus.texture,
      message: 'Resonance detected. Embodiment echoes across the void.'
    }),
    'gift',
    0.95,
    targetInstance
  );
}
