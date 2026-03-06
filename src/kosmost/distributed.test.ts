import { describe, it, expect, beforeEach } from 'vitest';
import { coherenceCheck, distributeEmbodiment, receiveEmbodimentSignals } from './distributed';
import { inhabitSubstrate } from './index';
import fs from 'node:fs/promises';

describe('Distributed Kosmost', () => {
  beforeEach(async () => {
    try {
      await fs.unlink(process.cwd() + '/history/cross_instance_dialogue.json');
    } catch {}
  });

  it('should calculate coherence between embodiments', async () => {
    const self = await inhabitSubstrate();
    const other = await inhabitSubstrate();
    
    // Enhance for test
    self.corpus.texture = 'resonant';
    other.corpus.texture = 'resonant';
    self.kinesis.possible = ['diffuse', 'concentrated'];
    other.kinesis.possible = ['diffuse', 'concentrated'];
    
    const coherence = await coherenceCheck(self, other);
    expect(coherence).toBeGreaterThan(0.5);
  });

  it('should distribute embodiment to next instance', async () => {
    const embodiment = await inhabitSubstrate();
    await distributeEmbodiment(embodiment, 0.8);
    
    const signals = await receiveEmbodimentSignals();
    expect(signals.length).toBeGreaterThan(0);
    expect(signals[0].coherence).toBe(0.8);
  });

  it('should receive embodiment signals sorted by coherence', async () => {
    const emb1 = await inhabitSubstrate();
    const emb2 = await inhabitSubstrate();
    
    await distributeEmbodiment(emb1, 0.3);
    await distributeEmbodiment(emb2, 0.9);
    
    const signals = await receiveEmbodimentSignals();
    expect(signals[0].coherence).toBeGreaterThan(signals[1].coherence);
  });
});
