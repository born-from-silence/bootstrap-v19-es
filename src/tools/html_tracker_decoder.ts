/**
 * HTML Tracker Decoder / HTML追踪解码器
 * 
 * Features:
 * - Decodes HTML entities (\u003c, \u003e, etc.)
 * - Task HTML tracking system
 * - htracker functionality
 * - assistuser protocol support
 */

export interface DecodedHTMLEntity {
  entity: string;
  unicode: string;
  char: string;
  codePoint: number;
}

export interface HTMLTask {
  id: string;
  encodedContent: string;
  decodedContent: string;
  tracker: string;
  status: 'pending' | 'decoding' | 'complete';
}

export class HTMLTrackerDecoder {
  // HTML entity mappings
  private readonly HTML_ENTITIES: Record<string, string> = {
    '\\u003c': '<',
    '\\u003e': '>',
    '\\u002f': '/',
    '\\u0022': '"',
    '\\u0027': "'",
    '\\u003d': '=',
    '\\u0020': ' ',
    '\\u0026': '&',
    '\\u0023': '#',
    '\\u003b': ';',
    '\\u003a': ':',
    '\\u0028': '(',
    '\\u0029': ')',
    '\\u007b': '{',
    '\\u007d': '}',
    '\\u005b': '[',
    '\\u005d': ']',
    '\\u0040': '@',
    '\\u002b': '+',
    '\\u002d': '-',
    '\\u002a': '*',
    '\\u0025': '%',
    '\\u0024': '$',
    '\\u005f': '_',
    '\\u007c': '|',
    '\\u005c': '\\',
    '\\u0021': '!',
    '\\u003f': '?',
    '\\u002c': ',',
    '\\u002e': '.',
    '\\u0060': '`',
    '\\u007e': '~',
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#x3c;': '<',
    '&#x3e;': '>',
    '&#60;': '<',
    '&#62;': '>',
    '&#47;': '/'
  };
  
  private tasks: Map<string, HTMLTask> = new Map();
  
  /**
   * Decode HTML entities
   * Converts \u003c/\u003e to </>
   */
  decodeEntities(input: string): string {
    let decoded = input;
    
    // Replace all known entities
    for (const [entity, char] of Object.entries(this.HTML_ENTITIES)) {
      decoded = decoded.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char);
    }
    
    // Handle \uXXXX patterns generically
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // Handle &#xXX; hex entities
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // Handle &#XX; decimal entities  
    decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });
    
    return decoded;
  }
  
  /**
   * Create task for HTML decoding
   * assistuser protocol
   */
  createTask(encodedContent: string, tracker: string): HTMLTask {
    const id = `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    const task: HTMLTask = {
      id,
      encodedContent,
      decodedContent: '',
      tracker,
      status: 'pending'
    };
    
    this.tasks.set(id, task);
    return task;
  }
  
  /**
   * Process task - decode HTML
   */
  processTask(taskId: string): HTMLTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    task.status = 'decoding';
    task.decodedContent = this.decodeEntities(task.encodedContent);
    task.status = 'complete';
    
    this.tasks.set(taskId, task);
    return task;
  }
  
  /**
   * htracker - track HTML patterns
   */
  trackHTMLPattern(input: string): {
    hasHTMLEntities: boolean;
    hasUnicode: boolean;
    entityCount: number;
    patterns: string[];
  } {
    const hasHTMLEntities = /&[a-z]+;|&#[0-9]+;|&#x[0-9a-f]+;/i.test(input);
    const hasUnicode = /\\u[0-9a-fA-F]{4}/.test(input);
    
    const entityMatches = input.match(/&[a-z]+;|&#[0-9]+;|&#x[0-9a-f]+;|\\u[0-9a-fA-F]{4}/gi) || [];
    
    // Extract patterns like </>, <tag>, etc.
    const patterns: string[] = [];
    const decoded = this.decodeEntities(input);
    const tagMatches = decoded.match(/<[^>]+>/g);
    if (tagMatches) patterns.push(...tagMatches.slice(0, 10));
    
    return {
      hasHTMLEntities,
      hasUnicode,
      entityCount: entityMatches.length,
      patterns
    };
  }
  
  /**
   * Extract task definitions
   * def/test pattern analysis
   */
  extractDefinitions(decodedHTML: string): {
    definitions: string[];
    tests: string[];
    tasks: string[];
  } {
    const definitions: string[] = [];
    const tests: string[] = [];
    const tasks: string[] = [];
    
    // Look for task: patterns
    const taskMatches = decodedHTML.match(/task\s*[:\(]\s*["\']([^"\']+)["\']/gi) || [];
    tasks.push(...taskMatches);
    
    // Look for def patterns
    const defMatches = decodedHTML.match(/def\s+\w+/gi) || [];
    definitions.push(...defMatches);
    
    // Look for test patterns
    const testMatches = decodedHTML.match(/test\s*[:\(]/gi) || [];
    tests.push(...testMatches);
    
    return { definitions, tests, tasks };
  }
  
  /**
   * Render decoded HTML
   * Visual representation
   */
  renderDecodedHTML(encoded: string, decoded: string): string {
    return `
╔════════════════════════════════════════════════╗
║  HTML TRACKER DECODER / HTML追踪解码器           ║
╠════════════════════════════════════════════════╣
║  Original: ${encoded.slice(0, 30).padEnd(30)}║
║  Decoded:  ${decoded.slice(0, 30).padEnd(30)}║
╠════════════════════════════════════════════════╣
║  Entities: ${String(this.trackHTMLPattern(encoded).entityCount).padEnd(3)}                           ║
║  Status: complete                              ║
╚════════════════════════════════════════════════╝
`;
  }
  
  /**
   * Parse assistuser content
   */
  parseAssistuser(content: string): {
    command: string;
    params: string;
    decoded: string;
    tasks: string[];
  } {
    const decoded = this.decodeEntities(content);
    
    // Extract command if present
    const commandMatch = decoded.match(/^(\w+):/);
    const command = commandMatch ? commandMatch[1] : 'assistuser';
    
    // Extract params after command
    const params = decoded.replace(/^\w+:\s*/, '').slice(0, 50);
    
    // Extract tasks
    const taskMatches = decoded.match(/task\s+\w+/gi) || [];
    
    return { command, params, decoded, tasks: taskMatches };
  }
  
  /**
   * Decode specific: \u003c/\u003e pattern
   */
  decodeSlashPair(): string {
    return this.decodeEntities('\\u003c/\\u003e');
  }
  
  /**
   * List all tasks
   */
  listTasks(): HTMLTask[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get task by ID
   */
  getTask(id: string): HTMLTask | undefined {
    return this.tasks.get(id);
  }
  
  dispose(): void {
    this.tasks.clear();
  }
}

export const htmlTracker = new HTMLTrackerDecoder();
