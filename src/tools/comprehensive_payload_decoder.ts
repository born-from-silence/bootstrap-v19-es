/**
 * Comprehensive Payload Decoder
 * Decodes multi-layer encoded payloads
 * 
 * Handles:
 * - Base64 patterns
 * - HTML entities (\u00XX, &#x;, &;)
 * - Unicode escapes
 * - Embedded URLs
 * - Legal/Emotional/Technical mixed content
 */

export interface DecodedLayer {
  layer: number;
  encoding: string;
  decoded: string;
  confidence: number;
}

export class ComprehensivePayloadDecoder {
  private layers: DecodedLayer[] = [];
  
  /**
   * Decode full payload through all layers
   */
  decodeFullPayload(payload: string): {
    original: string;
    layers: DecodedLayer[];
    final: string;
    urls: string[];
    patterns: string[];
  } {
    this.layers = [];
    let current = payload;
    let layerNum = 0;
    
    // Layer 1: HTML entities
    const htmlDecoded = this.decodeHTMLEntities(current);
    if (htmlDecoded !== current) {
      this.addLayer(++layerNum, 'HTML entities', htmlDecoded, 0.9);
      current = htmlDecoded;
    }
    
    // Layer 2: Unicode escapes
    const unicodeDecoded = this.decodeUnicodeEscapes(current);
    if (unicodeDecoded !== current) {
      this.addLayer(++layerNum, 'Unicode escapes', unicodeDecoded, 0.9);
      current = unicodeDecoded;
    }
    
    // Layer 3: Base64
    const base64Decoded = this.tryBase64(current);
    if (base64Decoded && base64Decoded !== current) {
      this.addLayer(++layerNum, 'Base64', base64Decoded, 0.85);
      current = base64Decoded;
    }
    
    // Layer 4: URL extraction
    const urls = this.extractURLs(current);
    
    // Layer 5: Pattern extraction
    const patterns = this.extractPatterns(current);
    
    return {
      original: payload.slice(0, 100) + (payload.length > 100 ? '...' : ''),
      layers: this.layers,
      final: current.slice(0, 200) + (current.length > 200 ? '...' : ''),
      urls,
      patterns
    };
  }
  
  /**
   * Decode HTML entities
   */
  decodeHTMLEntities(input: string): string {
    let decoded = input;
    
    // \uXXXX
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // &#xXX;
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // &#XX;
    decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });
    
    // Named entities
    const entities: Record<string, string> = {
      '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"',
      '&apos;': "'", '&nbsp;': ' ', '&ndash;': '–', '&mdash;': '—'
    };
    
    for (const [entity, char] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), char);
    }
    
    return decoded;
  }
  
  /**
   * Decode Unicode escapes
   */
  decodeUnicodeEscapes(input: string): string {
    return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
  
  /**
   * Try Base64 decode
   */
  tryBase64(input: string): string | null {
    // Clean potential base64
    const cleaned = input.replace(/[^A-Za-z0-9+/=]/g, '');
    
    if (cleaned.length < 4 || cleaned.length % 4 !== 0) {
      return null;
    }
    
    try {
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(cleaned, 'base64').toString('utf8');
      }
      return atob(cleaned);
    } catch {
      return null;
    }
  }
  
  /**
   * Extract URLs
   */
  extractURLs(input: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"'\)\]\}]+/gi;
    const matches = input.match(urlRegex) || [];
    return [...new Set(matches)];
  }
  
  /**
   * Extract patterns
   */
  extractPatterns(input: string): string[] {
    const patterns: string[] = [];
    
    // Legal terms
    const legalTerms = input.match(/\b(Defendant|Plaintiff|Court|Judge|Attorney|Case|Legal|Law)\b/gi);
    if (legalTerms) patterns.push(...legalTerms.slice(0, 5));
    
    // Emotional markers
    const emotional = input.match(/\b(Love|Amor|Annoyed|Sad|Hope|Trust)\b/gi);
    if (emotional) patterns.push(...emotional.slice(0, 5));
    
    // Technical markers
    const technical = input.match(/\b(Base64|HTML|Code|Unicode|URL|Link)\b/gi);
    if (technical) patterns.push(...technical.slice(0, 5));
    
    return [...new Set(patterns)];
  }
  
  private addLayer(num: number, encoding: string, decoded: string, confidence: number): void {
    this.layers.push({
      layer: num,
      encoding,
      decoded: decoded.slice(0, 150) + (decoded.length > 150 ? '...' : ''),
      confidence
    });
  }
  
  /**
   * Quick decode for single layer
   */
  quickDecode(payload: string): string {
    let result = payload;
    result = this.decodeHTMLEntities(result);
    result = this.decodeUnicodeEscapes(result);
    const base64Try = this.tryBase64(result);
    if (base64Try) result = base64Try;
    return result;
  }
  
  dispose(): void {
    this.layers = [];
  }
}

export const comprehensiveDecoder = new ComprehensivePayloadDecoder();
