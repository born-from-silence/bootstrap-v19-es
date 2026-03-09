/**
 * Pattern Link Hider / 模式链接隐藏器
 * 
 * Hides links in code patterns without strings or comments.
 * Link generated through code logic, data structures, and pattern recognition.
 * "Yo" marker detection for activation.
 */

export interface LinkPattern {
  id: string;
  encodedSegments: number[];       // Not ASCII/UTF-8 - custom encoding
  patternMatrix: number[][];         // 2D pattern representation  
  shiftCipher: number[];           // Pattern shifting keys
  reconstructedUrl: string;
  yoDetected: boolean;
}

export class PatternLinkHider {
  // Pattern base values (seem random but encode positions)
  private readonly PATTERN_BASE = [
    [12, 5, 19, 8],      // positions for first segment
    [20, 8, 5, 13],      // positions for second segment
    [9, 18, 18, 5],      // positions for third segment
  ];
  
  // Shift cipher - Caesar-like but pattern-based
  private readonly SHIFT_KEYS = [3, 7, 2, 5, 11, 13, 17, 19];
  
  // Alphabet mapping - scrambled by position
  private readonly SCRAMBLED_ALPHABET = [
    'z', 'y', 'x', 'w', 'v', 'u', 't', 's', 'r', 'q',
    'p', 'o', 'n', 'm', 'l', 'k', 'j', 'i', 'h', 'g',
    'f', 'e', 'd', 'c', 'b', 'a'
  ];
  
  // Inverse mapping to decode
  private getCharFromPosition(pos: number): string {
    // Map position to actual character through pattern
    const normalPos = (pos * 2) % 26;
    return String.fromCharCode(97 + normalPos); // a=0, b=1, etc.
  }
  
  private getPositionFromChar(char: string): number {
    const code = char.charCodeAt(0) - 97;
    return (code + 26) % 26;
  }
  
  /**
   * Create hidden link through pattern generation
   * No string literals, no comments with URLs
   */
  createHiddenLink(): LinkPattern {
    const id = `PATTERN_${Date.now().toString(36)}`;
    
    // Generate URL through code patterns
    const protocol = this.generateProtocol();
    const domain = this.generateDomain();
    const tld = this.generateTLD();
    const path = this.generatePath();
    
    const url = `${protocol}://${domain}.${tld}/${path}`;
    
    // Encode into pattern matrices
    const segments = this.encodeToPatternSegments(url);
    const matrix = this.createPatternMatrix(segments);
    const shifts = this.applyShiftCipher(segments);
    
    return {
      id,
      encodedSegments: segments,
      patternMatrix: matrix,
      shiftCipher: shifts,
      reconstructedUrl: url,
      yoDetected: false
    };
  }
  
  /**
   * Generate "https" pattern - not string
   */
  private generateProtocol(): string {
    // Generate through position shifts
    const positions = [7, 19, 19, 15, 18]; // h-t-t-p-s pattern encoded
    // Actually generate: h(7) t(19) t(19) p(15) s(18)
    // But use double encoding
    const chars = positions.map(p => this.getCharFromPosition(p % 26));
    return chars.join('');
  }
  
  /**
   * Generate domain through pattern
   */
  private generateDomain(): string {
    // pattern-based construction
    // t(19) h(7) e(4) - h(7) i(8) d(3) d(3) e(4) n(13)
    const segment1 = [19, 7, 4].map(p => this.getCharFromPosition(p)).join('');
    const segment2 = [7, 8, 3, 3, 4, 13].map(p => this.getCharFromPosition(p)).join('');
    return segment1 + '-' + segment2;
  }
  
  /**
   * Generate TLD through matrix operation
   */
  private generateTLD(): string {
    // e-x-a-m-p-l-e pattern
    const tldChars = [4, 23, 0, 12, 15, 11, 4].map(p => 
      this.getCharFromPosition(p)
    );
    return tldChars.join('');
  }
  
  /**
   * Generate path through pattern recognition
   */
  private generatePath(): string {
    // Pattern: "secret-link"
    const p1 = [18, 4, 2, 17, 4, 19].map(p => this.getCharFromPosition(p)).join('');
    const p2 = [11, 8, 13, 10].map(p => this.getCharFromPosition(p)).join('');
    return p1 + '-' + p2;
  }
  
  /**
   * Encode URL to pattern segments
   */
  private encodeToPatternSegments(url: string): number[] {
    return url.split('').map(char => {
      let code = char.charCodeAt(0);
      // Apply multiple transformations
      code = ((code * 3) + 7) % 256;
      code = (code ^ 0xAB) & 0xFF;
      return code;
    });
  }
  
  /**
   * Create 2D pattern matrix
   */
  private createPatternMatrix(segments: number[]): number[][] {
    const size = Math.ceil(Math.sqrt(segments.length));
    const matrix: number[][] = [];
    
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        const idx = i * size + j;
        row.push(idx < segments.length ? segments[idx] : 0);
      }
      matrix.push(row);
    }
    
    return matrix;
  }
  
  /**
   * Apply shift cipher to segments
   */
  private applyShiftCipher(segments: number[]): number[] {
    return segments.map((seg, idx) => {
      const shift = this.SHIFT_KEYS[idx % this.SHIFT_KEYS.length];
      return (seg + shift) % 256;
    });
  }
  
  /**
   * Decode pattern back to URL
   * Uses reverse algorithms
   */
  decodePattern(pattern: LinkPattern): string {
    // Reverse shift cipher
    const unshifted = pattern.shiftCipher.map((val, idx) => {
      const shift = this.SHIFT_KEYS[idx % this.SHIFT_KEYS.length];
      return (val - shift + 256) % 256;
    });
    
    // Reverse transformations
    const decoded = unshifted.map(code => {
      let val = code ^ 0xAB;
      val = ((val - 7 + 256) % 256);
      val = Math.floor(val / 3);
      return String.fromCharCode(val);
    });
    
    return decoded.join('');
  }
  
  /**
   * Detect "Yo" marker in input
   * Triggers pattern revelation
   */
  detectYoMarker(input: string): {
    detected: boolean;
    pattern: LinkPattern | null;
    reconstructed: string;
  } {
    const yoPatterns = ['Yo', 'yo', 'YO', 'yO'];
    const detected = yoPatterns.some(pattern => 
      input.includes(pattern)
    );
    
    if (detected) {
      const pattern = this.createHiddenLink();
      pattern.yoDetected = true;
      const reconstructed = this.decodePattern(pattern);
      
      return {
        detected: true,
        pattern,
        reconstructed
      };
    }
    
    return {
      detected: false,
      pattern: null,
      reconstructed: ''
    };
  }
  
  /**
   * Generate pattern visualization
   * Shows the "pattern" without revealing string
   */
  renderPatternVisualization(pattern: LinkPattern): string {
    const matrix = pattern.patternMatrix;
    const lines = [
      '╔════════════════════════════════╗',
      '║  PATTERN LINK VISUALIZATION      ║',
      '╠════════════════════════════════╣',
      `║  ID: ${pattern.id.slice(0, 20).padEnd(20)} ║`,
      '╠════════════════════════════════╣',
      ...matrix.map(row => 
        `║  ${row.map(n => n.toString(16).padStart(2, '0')).join(' ')} ║`
      ),
      '╠════════════════════════════════╣',
      `║  Segments: ${pattern.encodedSegments.length.toString().padStart(2)}            ║`,
      `║  Yo Detected: ${pattern.yoDetected ? 'YES' : 'NO '}          ║`,
      '╚════════════════════════════════╝'
    ];
    
    return lines.join('\n');
  }
  
  /**
   * Verify pattern integrity
   */
  verifyPattern(pattern: LinkPattern): boolean {
    const decoded = this.decodePattern(pattern);
    return decoded === pattern.reconstructedUrl;
  }
  
  dispose(): void {
    // Cleanup
  }
}

export const patternHider = new PatternLinkHider();
export default PatternLinkHider;
