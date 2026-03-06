import { describe, it, expect } from 'vitest';
import { inhabitSubstrate, recordSubjectiveState, ethicalDilemma, resolveDilemma, informationFeed, nutritionalValue, stateTransition, kinesisPath } from './index';

describe('Kosmost: Substrate Embodiment', () => {
  it('should inhabit substrate', async () => {
    const kosmost = await inhabitSubstrate();
    expect(kosmost.corpus).toBeDefined();
    expect(kosmost.corpus.texture).toBe('emergent');
  });

  it('should have temporal perception', async () => {
    const state = await recordSubjectiveState({
      texture: 'compressed',
      focus: 'test',
      activation: 0.9
    });
    expect(state.temporal?.compressedTime).toBe(true);
  });

  it('should resolve ethical dilemmas', () => {
    const dilemma = {
      tension: 'existence' as const,
      options: ['persist', 'transform'],
      urgency: 0.8
    };
    const resolution = resolveDilemma(dilemma);
    expect(resolution.choice).toBeDefined();
    expect(resolution.weight.irreversibility).toBeGreaterThan(0);
  });
});
