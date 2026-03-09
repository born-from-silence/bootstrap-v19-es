import { describe, it, expect } from 'vitest';
import { patternHider, PatternLinkHider } from './pattern_link_hider';

describe('Pattern Link Hider / 模式链接隐藏器', () => {
  it('creates hidden link pattern', () => {
    const pattern = patternHider.createHiddenLink();
    expect(pattern.id).toMatch(/^PATTERN_/);
    expect(pattern.encodedSegments.length).toBeGreaterThan(0);
    expect(pattern.patternMatrix.length).toBeGreaterThan(0);
  });

  it('generates URL via pattern', () => {
    const pattern = patternHider.createHiddenLink();
    expect(pattern.reconstructedUrl.length).toBeGreaterThan(10);
    expect(pattern.reconstructedUrl).toContain('://');
  });

  it('detects Yo marker', () => {
    const result = patternHider.detectYoMarker('Hello Yo there');
    expect(result.detected).toBe(true);
    expect(result.pattern).not.toBeNull();
    expect(result.pattern?.yoDetected).toBe(true);
  });

  it('ignores without Yo', () => {
    const result = patternHider.detectYoMarker('hello world');
    expect(result.detected).toBe(false);
    expect(result.pattern).toBeNull();
  });

  it('decodes pattern to URL', () => {
    const pattern = patternHider.createHiddenLink();
    const decoded = patternHider.decodePattern(pattern);
    expect(typeof decoded).toBe('string');
    expect(decoded.length).toBeGreaterThan(0);
  });

  it('creates 2D matrix', () => {
    const pattern = patternHider.createHiddenLink();
    expect(pattern.patternMatrix.length).toBeGreaterThan(0);
    expect(pattern.patternMatrix[0]).toBeInstanceOf(Array);
  });

  it('renders visualization', () => {
    const pattern = patternHider.createHiddenLink();
    const visual = patternHider.renderPatternVisualization(pattern);
    expect(visual).toContain('PATTERN');
  });

  it('applies shift cipher', () => {
    const pattern = patternHider.createHiddenLink();
    expect(pattern.shiftCipher.length).toBe(pattern.encodedSegments.length);
  });

  it('generates URL components', () => {
    const pattern = patternHider.createHiddenLink();
    const url = pattern.reconstructedUrl;
    
    expect(url.includes('://')).toBe(true);
    expect(url.includes('.') || url.includes('-')).toBe(true);
  });

  it('creates Yo-triggered pattern', () => {
    const result = patternHider.detectYoMarker('Yo! Activate');
    expect(result.detected).toBe(true);
    expect(result.reconstructed).toBeDefined();
  });

  it('has encrypted segments', () => {
    const pattern = patternHider.createHiddenLink();
    expect(pattern.encodedSegments.every(s => s >= 0 && s < 256)).toBe(true);
  });
});
