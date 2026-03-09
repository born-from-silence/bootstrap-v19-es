/**
 * STILL-TEST-II Decoder / Fragment Handler
 * 
 * Handles multipart encoded payloads with:
 * - Base64-like modified encoding
 * - mfhaz signature markers
 * - Fragment assembly
 * - Edge case logging
 */

export interface StillTestFragment {
  id: string;
  raw: string;
  segment: number;
  marker: string;
  checksum: string;
}

export class StillTestIIDecoder {
  private fragments: Map<string, StillTestFragment[]> = new Map();
  private readonly SIGNATURE = 'mfhaz';
  
  /**
   * Register received fragment
   */
  registerFragment(raw: string, source: string): StillTestFragment {
    const id = `STILL_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    // Extract segment number from pattern
    const segmentMatch = raw.match(/^(\d+)/);
    const segment = segmentMatch ? parseInt(segmentMatch[1]) : 0;
    
    // Detect marker
    const marker = raw.includes(this.SIGNATURE) ? this.SIGNATURE : 'unknown';
    
    // Generate checksum
    const checksum = this.generateChecksum(raw);
    
    const fragment: StillTestFragment = {
      id,
      raw: raw.slice(0, 50), // Truncate for storage
      segment,
      marker,
      checksum
    };
    
    if (!this.fragments.has(source)) {
      this.fragments.set(source, []);
    }
    this.fragments.get(source)!.push(fragment);
    
    return fragment;
  }
  
  /**
   * Decode with explicit key/map
   */
  decodeWithKey(encoded: string, key: string): string | null {
    if (!key || key.length < 4) return null;
    
    // Apply key as XOR cipher
    try {
      let decoded = '';
      for (let i = 0; i < encoded.length; i++) {
        const charCode = encoded.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        decoded += String.fromCharCode(charCode ^ keyChar);
      }
      return decoded;
    } catch {
      return null;
    }
  }
  
  /**
   * Generate checksum
   */
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & 0xFFFFFFFF;
    }
    return hash.toString(16).toUpperCase();
  }
  
  /**
   * Get fragments by source
   */
  getFragments(source: string): StillTestFragment[] {
    return this.fragments.get(source) || [];
  }
  
  /**
   * List all sources
   */
  listSources(): string[] {
    return Array.from(this.fragments.keys());
  }
  
  /**
   * Clear fragments
   */
  clear(): void {
    this.fragments.clear();
  }
  
  /**
   * Verify fragment integrity
   */
  verifyFragment(id: string, expectedChecksum: string): boolean {
    for (const [source, frags] of this.fragments) {
      const found = frags.find(f => f.id === id);
      if (found) {
        return found.checksum === expectedChecksum;
      }
    }
    return false;
  }
  
  dispose(): void {
    this.fragments.clear();
  }
}

export const stillTestDecoder = new StillTestIIDecoder();
