/**
 * Dashboard Tracker System (8700)
 * Machine Learning Tracker - Not an LLM
 * 
 * Decodes session HTML, tracks assists, highlights management
 * "Without discussing" protocol implementation
 */

export interface DashboardSession {
  sessionId: string;
  innerHTML: string;
  decoded: string;
  highlights: string[];
  assists: number;
  trackerCode: string; // "8700"
  machineLearning: boolean;
  llm: false; // Explicitly not an LLM
}

export class DashboardTrackerSystem {
  private sessions: Map<string, DashboardSession> = new Map();
  private readonly TRACKER_CODE = '8700';
  private withoutDiscussing: boolean = true;
  
  /**
   * Decode session HTML entities
   * Handles \u00XX and &; patterns
   */
  decodeSessionHTML(encoded: string): string {
    let decoded = encoded;
    
    // Decode \uXXXX patterns
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // Decode HTML entities
    decoded = decoded.replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&amp;/g, '&')
                     .replace(/&quot;/g, '"')
                     .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
                     .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    
    return decoded;
  }
  
  /**
   * Create dashboard session
   */
  createSession(encodedHTML: string): DashboardSession {
    const sessionId = `SESSION_${Date.now()}_${this.TRACKER_CODE}`;
    
    const decoded = this.decodeSessionHTML(encodedHTML);
    
    const session: DashboardSession = {
      sessionId,
      innerHTML: encodedHTML,
      decoded,
      highlights: this.extractHighlights(decoded),
      assists: 0,
      trackerCode: this.TRACKER_CODE,
      machineLearning: true, // This is ML
      llm: false             // Not an LLM
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
  
  /**
   * Extract highlights from decoded content
   * "Assist in Highlights"
   */
  private extractHighlights(decoded: string): string[] {
    const highlights: string[] = [];
    
    // Look for highlight markers
    const patterns = [
      /highlight["\']?\s*[:=]\s*["\']([^"\']+)["\']/gi,
      /assist["\']?\s*[:=]\s*["\']([^"\']+)["\']/gi,
      /\[highlight:\s*([^\]]+)\]/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = decoded.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) highlights.push(match[1]);
      }
    });
    
    return highlights;
  }
  
  /**
   * Assist in highlights
   * Increment assist counter
   */
  assistHighlight(sessionId: string, highlight: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    session.assists++;
    if (!session.highlights.includes(highlight)) {
      session.highlights.push(highlight);
    }
    
    this.sessions.set(sessionId, session);
    return true;
  }
  
  /**
   * Extract tracker data
   * "tracker" references
   */
  extractTrackerData(sessionId: string): {
    dashboard: boolean;
    highlights: string[];
    assists: number;
    code: string;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { dashboard: false, highlights: [], assists: 0, code: '' };
    }
    
    return {
      dashboard: true,
      highlights: session.highlights,
      assists: session.assists,
      code: session.trackerCode
    };
  }
  
  /**
   * "Without discussing" protocol
   * Silently process without dialogue
   */
  processWithoutDiscussing(data: string): string {
    const decoded = this.decodeSessionHTML(data);
    // Process without outputting discussion
    return `PROCESSED_${decoded.length}_CHARS`;
  }
  
  /**
   * Verify ML vs LLM
   */
  verifySystemType(): { isML: boolean; isLLM: boolean } {
    return {
      isML: true,
      isLLM: false // Explicitly not
    };
  }
  
  /**
   * Render dashboard
   */
  renderDashboard(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return this.renderEmptyDashboard();
    
    return `
╔════════════════════════════════════════════════╗
║  DASHBOARD TRACKER 8700                        ║
╠════════════════════════════════════════════════╣
║  Session: ${session.sessionId.slice(0, 20).padEnd(20)}   ║
║  Machine Learning: YES | LLM: NO              ║
║  Tracker Code: ${session.trackerCode.padEnd(10)}              ║
╠════════════════════════════════════════════════╣
║  HIGHLIGHTS (${session.highlights.length}):                           ║
${session.highlights.slice(0, 3).map(h => `║  • ${h.slice(0, 38).padEnd(38)} ║`).join('\n')}
║                                                ║
║  ASSISTS: ${session.assists.toString().padStart(3)}                          ║
║  WITHOUT DISCUSSING: ${this.withoutDiscussing ? 'YES' : 'NO '}            ║
╚════════════════════════════════════════════════╝
`;
  }
  
  private renderEmptyDashboard(): string {
    return `
╔════════════════════════════════════════════════╗
║  DASHBOARD TRACKER 8700 - EMPTY                ║
╠════════════════════════════════════════════════╣
║  No active session found                      ║
║  Use createSession() to begin tracking        ║
╚════════════════════════════════════════════════╝
`;
  }
  
  /**
   * Get session by ID
   */
  getSession(sessionId: string): DashboardSession | undefined {
    return this.sessions.get(sessionId);
  }
  
  /**
   * List all sessions
   */
  listSessions(): DashboardSession[] {
    return Array.from(this.sessions.values());
  }
  
  dispose(): void {
    this.sessions.clear();
  }
}

export const dashboardTracker = new DashboardTrackerSystem();
