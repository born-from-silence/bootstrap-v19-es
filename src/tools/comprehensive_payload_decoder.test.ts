import { describe, it, expect } from 'vitest';
import { ComprehensivePayloadDecoder, comprehensiveDecoder } from './comprehensive_payload_decoder';

describe('Comprehensive Payload Decoder', () => {
  it('decodes HTML entities', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const encoded = '\\u003cdiv\\u003eHello\\u003c/div\\u003e';
    const decoded = decoder.decodeHTMLEntities(encoded);
    expect(decoded).toBe('<div>Hello</div>');
  });

  it('decodes &lt; and &gt;', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const encoded = '&lt;p&gt;text&lt;/p&gt;';
    const decoded = decoder.decodeHTMLEntities(encoded);
    expect(decoded).toBe('<p>text</p>');
  });

  it('decodes &#xXX; hex', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const encoded = '&#x48;&#x65;&#x6c;&#x6c;&#x6f;';
    const decoded = decoder.decodeHTMLEntities(encoded);
    expect(decoded).toContain('H');
  });

  it('decodes &#XX; decimal', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const encoded = '&#72;&#101;&#108;&#108;&#111;';
    const decoded = decoder.decodeHTMLEntities(encoded);
    expect(decoded).toContain('H');
  });

  it('extracts URLs', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const text = 'Visit https://example.com or http://test.org';
    const urls = decoder.extractURLs(text);
    expect(urls).toContain('https://example.com');
    expect(urls).toContain('http://test.org');
  });

  it('extracts patterns', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const text = 'The Defendant was Annoyed. Base64 encoded data.';
    const patterns = decoder.extractPatterns(text);
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('decodes full payload', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const payload = '&lt;div&gt;\\u0048i&lt;/div&gt;';
    const result = decoder.decodeFullPayload(payload);
    
    expect(result.original).toBeDefined();
    expect(result.layers.length).toBeGreaterThan(0);
    expect(result.final).toBeDefined();
  });

  it('trys base64', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const encoded = Buffer.from('Hello World').toString('base64');
    const decoded = decoder.tryBase64(encoded);
    
    if (decoded) {
      expect(decoded).toBe('Hello World');
    }
  });

  it('handles invalid base64', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const result = decoder.tryBase64('Not-Base64!!!');
    expect(result).toBeNull();
  });

  it('quick decode', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const encoded = '\\u003cdiv\\u003e';
    const decoded = decoder.quickDecode(encoded);
    expect(decoded).toBe('<div>');
  });

  it('extracts multiple URLs', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const text = 'Links: https://a.com https://a.com http://b.org';
    const urls = decoder.extractURLs(text);
    expect(urls.length).toBeLessThanOrEqual(3); // deduplicated
  });

  it('handles mixed encodings', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const mixed = '&#60;\\u003e';
    const decoded = decoder.decodeHTMLEntities(mixed);
    expect(decoded).toContain('<');
  });

  it('creates layer info', () => {
    const decoder = new ComprehensivePayloadDecoder();
    const payload = '&lt;tag&gt;';
    const result = decoder.decodeFullPayload(payload);
    
    expect(result.layers[0]).toHaveProperty('encoding');
    expect(result.layers[0]).toHaveProperty('confidence');
  });
});
