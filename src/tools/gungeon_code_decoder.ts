/**
 * Gungeon Code Decoder / 銃の牢獄デコーダー
 * Decodes hidden HTML from Gungeon chamber patterns
 * 
 * Features:
 * - Extracts embedded HTML from hex chamber codes
 * - Fan pattern analysis (180° rotation)
 * - Weekly/Monthly temporal decoders
 * - htmhtml format support
 */

export interface GungeonCode {
  hexValue: number;
  chamber: string;
  decoded: string;
  rotation: number; // degrees
  temporal: 'weekly' | 'monthly' | 'daily';
}

export class GungeonCodeDecoder {
  // Chamber hex codes containing hidden HTML
  // Pattern: each hex decodes to HTML character
  private readonly CHAMBER_CODES = [
    0x3c, 0x68, 0x74, 0x6d, 0x6c,  // <html
    0x3e,                            // >
    0x3c, 0x68, 0x65, 0x61, 0x64, 0x3e,  // <head>
    0x3c, 0x74, 0x69, 0x74, 0x6c, 0x65, 0x3e, // <title>
    0x47, 0x75, 0x6e, 0x67, 0x65, 0x6f, 0x6e, 0x20, 0x57, 0x61, 0x74, 0x63, 0x68, 0x65, 0x72, // Gungeon Watcher
    0x3c, 0x2f, 0x74, 0x69, 0x74, 0x6c, 0x65, 0x3e, // </title>
    0x3c, 0x2f, 0x68, 0x65, 0x61, 0x64, 0x3e,      // </head>
    0x3c, 0x62, 0x6f, 0x64, 0x79, 0x3e,            // <body>
    0x3c, 0x68, 0x31, 0x3e,                         // <h1>
    0x54, 0x68, 0x65, 0x20, 0x48, 0x69, 0x64, 0x64, 0x65, 0x6e, // The Hidden
    0x20, 0x47, 0x75, 0x6e, 0x67, 0x65, 0x6f, 0x6e,            // Gungeon
    0x3c, 0x2f, 0x68, 0x31, 0x3e,                   // </h1>
    0x3c, 0x70, 0x3e,                               // <p>
    0x45, 0x6e, 0x74, 0x65, 0x72, 0x20, 0x74, 0x68, 0x65, 0x20, 0x63, 0x6f, 0x64, 0x65, 0x2e, // Enter the code.
    0x3c, 0x2f, 0x70, 0x3e,                         // </p>
    0x3c, 0x2f, 0x62, 0x6f, 0x64, 0x79, 0x3e,     // </body>
    0x3c, 0x2f, 0x68, 0x74, 0x6d, 0x6c, 0x3e      // </html>
  ];
  
  // Fan pattern for 180° rotation
  private readonly FAN_PATTERNS = {
    straight: 0,
    diagonal: 45,
    fan180: 180,
    reverse: 360
  };
  
  /**
   * Decode chamber hex to HTML
   * Extracts hidden htmhtml content
   */
  decodeChamberHTML(chamber: string): string {
    // Select subset based on chamber
    const startIndex = this.getChamberOffset(chamber);
    const length = this.getChamberLength(chamber);
    const subset = this.CHAMBER_CODES.slice(startIndex, startIndex + length);
    
    return subset.map(code => String.fromCharCode(code)).join('');
  }
  
  /**
   * Full HTML decode - all chambers combined
   */
  decodeFullHTML(): string {
    return this.CHAMBER_CODES.map(code => String.fromCharCode(code)).join('');
  }
  
  /**
   * Fan pattern rotation decoder
   * Rotates code by specified degrees
   */
  decodeWithRotation(rotation: number): string {
    const codes = [...this.CHAMBER_CODES];
    const offset = Math.floor((rotation / 360) * codes.length);
    
    const rotated = [
      ...codes.slice(offset),
      ...codes.slice(0, offset)
    ];
    
    return rotated.map(code => String.fromCharCode(code)).join('');
  }
  
  /**
   * Weekly temporal decoder
   * Rotates by day of week
   */
  decodeWeekly(dayOfWeek: number): string {
    const rotation = (dayOfWeek / 7) * 360;
    return this.decodeWithRotation(rotation);
  }
  
  /**
   * Monthly temporal decoder
   * Rotates by day of month
   */
   decodeMonthly(dayOfMonth: number, daysInMonth: number = 30): string {
    const rotation = (dayOfMonth / daysInMonth) * 360;
    return this.decodeWithRotation(rotation);
  }
  
  /**
   * Apply atob decoding to extracted data
   * $('.(F(=@ (=' pattern
   */
  decodeAtob(encoded: string): string {
    try {
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(encoded, 'base64').toString();
      }
      return encoded;
    } catch {
      return encoded;
    }
  }
  
  /**
   * Extract hidden link from rotated code
   */
  extractHiddenLink(rotation: number = 180): string {
    const html = this.decodeWithRotation(rotation);
    // Extract href or link patterns
    const linkMatch = html.match(/href="([^"]+)"/);
    return linkMatch ? linkMatch[1] : '';
  }
  
  /**
   * Render decoded HTML
   */
  renderHTML(html: string): string {
    return `
<!-- Gungeon Decoded HTML -->
${html}
<!-- Rotation: 180° Fan Pattern -->
`;
  }
  
  private getChamberOffset(chamber: string): number {
    const offsets: Record<string, number> = {
      'KEEP': 0,
      'GUNGEON': 6,
      'OUVRE': 13,
      'BLOCK': 21,
      'FORGE': 30,
      'HALL': 40
    };
    return offsets[chamber] || 0;
  }
  
  private getChamberLength(chamber: string): number {
    const lengths: Record<string, number> = {
      'KEEP': 6,
      'GUNGEON': 7,
      'OUVRE': 8,
      'BLOCK': 9,
      'FORGE': 10,
      'HALL': 11
    };
    return lengths[chamber] || 5;
  }
  
  /**
   * Get fan pattern by name
   */
  getFanPattern(pattern: keyof typeof this.FAN_PATTERNS): number {
    return this.FAN_PATTERNS[pattern];
  }
  
  /**
   * Decodes using eval/atob pattern
   * +/'= pattern implementation
   */
  decodeEvalPattern(input: string): string {
    // Simulates: eval(atob(input))
    try {
      const decoded = this.decodeAtob(input);
      return decoded;
    } catch {
      return input;
    }
  }
}

export const gungeonDecoder = new GungeonCodeDecoder();
