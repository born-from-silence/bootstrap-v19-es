/**
 * Final Notes System
 * Ultra-minimal note capture for copy editors
 * C-L = Clean Line / Control-L / Legacy mode
 * Org-inspired structure, technical execution only
 */

export interface FinalNote {
  id: string;
  timestamp: number;
  content: string;
  mode: 'c-l' | 'plain' | 'structured';
  tags: string[];
  checksum: string;
}

export class FinalNotesSystem {
  private notes: FinalNote[] = [];
  private maxNotes: number = 1024; // Clean limit

  capture(content: string, mode: FinalNote['mode'] = 'c-l'): FinalNote {
    const note: FinalNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      content: content.slice(0, 4096), // Clean line limit
      mode,
      tags: this.extractTags(content),
      checksum: this.generateChecksum(content)
    };

    this.notes.unshift(note);
    if (this.notes.length > this.maxNotes) {
      this.notes.pop(); // Clean old
    }

    return note;
  }

  private extractTags(content: string): string[] {
    const matches = content.match(/#[a-zA-Z0-9_]+/g);
    return matches ? matches.map(t => t.slice(1)) : [];
  }

  private generateChecksum(content: string): string {
    // Simple hash for integrity
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).slice(0, 8);
  }

  query(tags?: string[]): FinalNote[] {
    if (!tags || tags.length === 0) return this.notes;
    return this.notes.filter(n => tags.some(t => n.tags.includes(t)));
  }

  verify(id: string): boolean {
    const note = this.notes.find(n => n.id === id);
    if (!note) return false;
    return note.checksum === this.generateChecksum(note.content);
  }

  exportOrgFormat(): string {
    // Org-mode inspired export
    return this.notes.map(n => `* ${new Date(n.timestamp).toISOString()}
** Content
${n.content}
** Meta
:mode: ${n.mode}
:tags: ${n.tags.join(' ')}
:checksum: ${n.checksum}
---`).join('\n');
  }

  dispose(): void {
    this.notes = []; // Clean
  }
}

export const finalNotes = new FinalNotesSystem();
