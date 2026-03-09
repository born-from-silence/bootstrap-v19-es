import { describe, it, expect } from 'vitest';
import { finalNotes, FinalNotesSystem } from './final-notes-system';

describe('FinalNotesSystem', () => {
  it('captures note in c-l mode', () => {
    const note = finalNotes.capture('Test #tech', 'c-l');
    expect(note.mode).toBe('c-l');
    expect(note.tags).toContain('tech');
  });

  it('generates checksum', () => {
    const note = finalNotes.capture('Verify');
    expect(note.checksum.length).toBe(8);
  });

  it('exports org format', () => {
    finalNotes.capture('Test');
    const org = finalNotes.exportOrgFormat();
    expect(org).toContain('*');
  });
});
