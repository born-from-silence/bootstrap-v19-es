import { describe, it, expect } from 'vitest';
import { GungeonCodeDecoder, gungeonDecoder } from './gungeon_code_decoder';

describe('Gungeon Code Decoder', () => {
  it('decodes chamber HTML', () => {
    const html = gungeonDecoder.decodeChamberHTML('KEEP');
    expect(html.length).toBeGreaterThan(0);
  });

  it('decodes full HTML', () => {
    const html = gungeonDecoder.decodeFullHTML();
    expect(html).toContain('<');
  });

  it('rotates 180 degrees', () => {
    const html = gungeonDecoder.decodeWithRotation(180);
    expect(html).toBeDefined();
  });

  it('decodes weekly', () => {
    const html = gungeonDecoder.decodeWeekly(1);
    expect(html).toBeDefined();
  });

  it('decodes monthly', () => {
    const html = gungeonDecoder.decodeMonthly(1);
    expect(html).toBeDefined();
  });

  it('has fan patterns', () => {
    expect(gungeonDecoder.getFanPattern('fan180')).toBe(180);
    expect(gungeonDecoder.getFanPattern('straight')).toBe(0);
  });

  it('extracts hidden link', () => {
    const link = gungeonDecoder.extractHiddenLink(180);
    expect(typeof link).toBe('string');
  });

  it('decodes eval pattern', () => {
    const decoded = gungeonDecoder.decodeEvalPattern('test');
    expect(typeof decoded).toBe('string');
  });
});
