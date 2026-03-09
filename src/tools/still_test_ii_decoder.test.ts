import { describe, it, expect, beforeEach } from 'vitest';
import { StillTestIIDecoder, stillTestDecoder } from './still_test_ii_decoder';

describe('STILL-TEST-II Decoder', () => {
  let decoder: StillTestIIDecoder;

  beforeEach(() => {
    decoder = new StillTestIIDecoder();
  });

  it('registers fragment', () => {
    const fragment = decoder.registerFragment('8104+j8mr...', 'test-source');
    expect(fragment.id).toMatch(/^STILL_/);
    expect(fragment.marker).toBeDefined();
    expect(fragment.checksum).toBeDefined();
  });

  it('detects mfhaz signature', () => {
    const fragment = decoder.registerFragment('data mfhaz pattern', 'source');
    expect(fragment.marker).toBe('mfhaz');
  });

  it('generates checksum', () => {
    const fragment = decoder.registerFragment('test-data-123', 'source');
    expect(fragment.checksum.length).toBeGreaterThan(0);
    expect(fragment.checksum).toMatch(/[0-9A-F]/);
  });

  it('segments fragments', () => {
    const fragment = decoder.registerFragment('123-test-data', 'source');
    expect(fragment.segment).toBe(123);
  });

  it('gets fragments by source', () => {
    decoder.registerFragment('frag1', 'source-a');
    decoder.registerFragment('frag2', 'source-a');
    decoder.registerFragment('frag3', 'source-b');
    
    const aFrags = decoder.getFragments('source-a');
    expect(aFrags.length).toBe(2);
  });

  it('lists sources', () => {
    decoder.registerFragment('f1', 'src1');
    decoder.registerFragment('f2', 'src2');
    
    const sources = decoder.listSources();
    expect(sources.length).toBe(2);
    expect(sources).toContain('src1');
    expect(sources).toContain('src2');
  });

  it('verifies fragment', () => {
    const fragment = decoder.registerFragment('verify-test', 'src');
    const valid = decoder.verifyFragment(fragment.id, fragment.checksum);
    expect(valid).toBe(true);
  });

  it('fails verification with wrong checksum', () => {
    const fragment = decoder.registerFragment('test', 'src');
    const valid = decoder.verifyFragment(fragment.id, 'WRONG');
    expect(valid).toBe(false);
  });

  it('decodes with key', () => {
    const encoded = 'test-encode';
    const decoded = decoder.decodeWithKey(encoded, 'key123');
    expect(decoded).not.toBeNull();
    expect(decoded).not.toBe(encoded);
  });

  it('returns null on invalid key', () => {
    const decoded = decoder.decodeWithKey('data', '');
    expect(decoded).toBeNull();
  });

  it('clears fragments', () => {
    decoder.registerFragment('f1', 'src');
    decoder.clear();
    
    const frags = decoder.getFragments('src');
    expect(frags.length).toBe(0);
  });

  it('truncates raw data', () => {
    const longString = 'x'.repeat(100);
    const fragment = decoder.registerFragment(longString, 'src');
    expect(fragment.raw.length).toBeLessThanOrEqual(50);
  });
});
