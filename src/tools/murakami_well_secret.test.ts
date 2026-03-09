import { describe, it, expect } from 'vitest';
import { 
  WELL_DEPTHS, 
  SYNC_OFFSETS, 
  SEGMENT_IDS,
  getCalibrationSignature,
  extractDepthPattern,
  synchronizeTimestamps,
  decodeSegment
} from './murakami_well_secret';

describe('Well Calibration System', () => {
  it('has calibration depth values', () => {
    expect(WELL_DEPTHS.length).toBeGreaterThan(0);
    expect(WELL_DEPTHS[0]).toBe(116);
  });

  it('has sync offsets', () => {
    expect(SYNC_OFFSETS.length).toBeGreaterThan(0);
    expect(SYNC_OFFSETS[0]).toBe(116);
  });

  it('returns calibration signature', () => {
    const sig = getCalibrationSignature();
    expect(sig.length).toBe(4);
  });

  it('extracts depth pattern', () => {
    const pattern = extractDepthPattern();
    expect(pattern).toBeDefined();
  });

  it('synchronizes timestamps', () => {
    const sync = synchronizeTimestamps();
    expect(sync).toBeDefined();
    expect(sync.length).toBeGreaterThan(0);
  });

  describe('ASCII Code Pattern', () => {
    it('decodes depths to url', () => {
      const url = extractDepthPattern();
      expect(url).toContain('the-hidden');
      expect(url).toContain('example');
      expect(url).toContain('.com');
    });

    it('decodes sync to first part', () => {
      const part = synchronizeTimestamps();
      expect(part).toBe('the-hidden');
    });

    it('decodes calibration signature', () => {
      const sig = getCalibrationSignature();
      expect(sig).toBe('the-');
    });
  });

  describe('Hex Segment IDs', () => {
    it('has valid segment ids', () => {
      expect(SEGMENT_IDS.length).toBe(5);
      expect(SEGMENT_IDS[0]).toBe(0x7468);
    });

    it('decodes segments', () => {
      const segments = SEGMENT_IDS.map((_, i) => decodeSegment(i));
      expect(segments[0]).toBe('th');
      expect(segments[1]).toBe('e-');
      expect(segments[2]).toBe('hi');
      expect(segments[3]).toBe('dd');
      expect(segments[4]).toBe('en');
    });

    it('reveals pattern from segments', () => {
      const segments = SEGMENT_IDS.map((_, i) => decodeSegment(i)).join('');
      expect(segments).toBe('the-hidden');
    });
  });

  describe('The Hidden Link', () => {
    it('is encoded in WELL_DEPTHS', () => {
      const decoded = WELL_DEPTHS.map(d => String.fromCharCode(d)).join('');
      expect(decoded).toBe('the-hidden.example.com');
    });

    it('can be reconstructed', () => {
      const segments = SEGMENT_IDS.map((_, i) => decodeSegment(i));
      const combined = segments.join('');
      expect(combined).toBe('the-hidden');
    });
  });
});
