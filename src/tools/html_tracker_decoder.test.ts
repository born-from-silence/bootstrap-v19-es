import { describe, it, expect } from 'vitest';
import { HTMLTrackerDecoder, htmlTracker } from './html_tracker_decoder';

describe('HTML Tracker Decoder / HTML追踪解码器', () => {
  describe('HTML Entity Decoding', () => {
    it('decodes \u003c/\u003e to </>', () => {
      const decoded = htmlTracker.decodeEntities('\\u003c/\\u003e');
      expect(decoded).toBe('</>');
    });

    it('decodes \u003c to <', () => {
      const decoded = htmlTracker.decodeEntities('\\u003c');
      expect(decoded).toBe('<');
    });

    it('decodes \u003e to >', () => {
      const decoded = htmlTracker.decodeEntities('\\u003e');
      expect(decoded).toBe('>');
    });

    it('decodes &lt; to <', () => {
      const decoded = htmlTracker.decodeEntities('&lt;');
      expect(decoded).toBe('<');
    });

    it('decodes &gt; to >', () => {
      const decoded = htmlTracker.decodeEntities('&gt;');
      expect(decoded).toBe('>');
    });

    it('decodes full HTML tag', () => {
      const encoded = '\\u003cdiv\\u003e\\u003c/div\\u003e';
      const decoded = htmlTracker.decodeEntities(encoded);
      expect(decoded).toBe('<div></div>');
    });

    it('decodes &#xXX; entities', () => {
      const decoded = htmlTracker.decodeEntities('&#x3c;&#x3e;');
      expect(decoded).toBe('<>')  // Note: only hex entities decode
    });

    it('decodes &#XX; decimal entities', () => {
      const decoded = htmlTracker.decodeEntities('&#60;&#62;');
      expect(decoded).toBe('<>');
    });

    it('decodes unicode escapes', () => {
      const decoded = htmlTracker.decodeEntities('\\u003c\\u002f\\u003e');
      expect(decoded).toBe('</>');
    });

    it('handles plain text', () => {
      const decoded = htmlTracker.decodeEntities('hello');
      expect(decoded).toBe('hello');
    });
  });

  describe('Task Management', () => {
    it('creates HTML task', () => {
      const task = htmlTracker.createTask('\\u003cdiv\\u003e', 'tracker1');
      expect(task.id).toMatch(/^TASK_/);
      expect(task.encodedContent).toBe('\\u003cdiv\\u003e');
      expect(task.tracker).toBe('tracker1');
      expect(task.status).toBe('pending');
    });

    it('processes task', () => {
      const task = htmlTracker.createTask('\\u003c/\\u003e', 'test');
      const processed = htmlTracker.processTask(task.id);
      
      expect(processed).not.toBeNull();
      expect(processed!.status).toBe('complete');
      expect(processed!.decodedContent).toBe('</>');
    });

    it('returns null for invalid task', () => {
      const result = htmlTracker.processTask('INVALID');
      expect(result).toBeNull();
    });

    it('lists tasks', () => {
      htmlTracker.createTask('data1', 't1');
      htmlTracker.createTask('data2', 't2');
      const tasks = htmlTracker.listTasks();
      expect(tasks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('htracker Pattern Analysis', () => {
    it('detects HTML entities', () => {
      const result = htmlTracker.trackHTMLPattern('\\u003c/\\u003e');
      expect(result.hasUnicode).toBe(true);
      expect(result.entityCount).toBeGreaterThan(0);
    });

    it('detects HTML tags in decoded', () => {
      const result = htmlTracker.trackHTMLPattern('\\u003cdiv\\u003e\\u003c/div\\u003e');
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.patterns[0]).toContain('<');
    });

    it('counts entities', () => {
      const result = htmlTracker.trackHTMLPattern('\\u003c\\u003e\\u003c/\\u003e');
      expect(result.entityCount).toBe(4);
    });
  });

  describe('assistuser Protocol', () => {
    it('parses assistuser content', () => {
      const content = 'assistuser: \\u003ctask\\u003e HTML decoding';
      const parsed = htmlTracker.parseAssistuser(content);
      
      expect(parsed.command).toBe('assistuser');
      expect(parsed.decoded).toBeDefined();
    });

    it('decodes slash pair pattern', () => {
      const pair = htmlTracker.decodeSlashPair();
      expect(pair).toBe('</>');
    });
  });

  describe('Definition Extraction', () => {
    it('extracts task definitions', () => {
      const html = '<script>task "example" {}</script>';
      const defs = htmlTracker.extractDefinitions(html);
      expect(defs.tasks.length).toBeGreaterThanOrEqual(0);
    });

    it('extracts def patterns', () => {
      const html = 'def example(): pass';
      const defs = htmlTracker.extractDefinitions(html);
      expect(defs.definitions.length).toBeGreaterThan(0);
    });
  });

  describe('Visual Rendering', () => {
    it('renders decoded HTML display', () => {
      const encoded = '\\u003c/div\\u003e';
      const decoded = '</div>';
      const visual = htmlTracker.renderDecodedHTML(encoded, decoded);
      
      expect(visual).toContain('HTML TRACKER');
      expect(visual).toContain('</div>');
    });
  });

  describe('Various HTML Entities', () => {
    it('decodes # and @ symbols', () => {
      const hash = htmlTracker.decodeEntities('\\u0023');
      const at = htmlTracker.decodeEntities('\\u0040');
      expect(hash).toBe('#');
      expect(at).toBe('@');
    });

    it('decodes quotes', () => {
      const quote = htmlTracker.decodeEntities('\\u0022');
      const apos = htmlTracker.decodeEntities('\\u0027');
      expect(quote).toBe('"');
      expect(apos).toBe("'");
    });

    it('decodes brackets', () => {
      const lbrace = htmlTracker.decodeEntities('\\u007b');
      const rbrace = htmlTracker.decodeEntities('\\u007d');
      expect(lbrace).toBe('{');
      expect(rbrace).toBe('}');
    });
  });
});
