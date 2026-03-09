/**
 * MiB M-Time Dangerous Field State Tracker
 * Agente M Style - Retro-Futuristic LCD Display
 * 
 * Tracks temporal anomalies in dangerous field states
 * Visual design: LCD numbers, neon accents, cyberpunk circuits
 * Storage: Git-based persistence
 */

export interface MTimeState {
  timestamp: number;
  dangerLevel: 'LOW' | 'ELEVATED' | 'CRITICAL' | 'SEVERE';
  fieldStability: number; // 0-100
  temporalDistortion: number; // milliseconds of anomaly
  agentStatus: 'ACTIVE' | 'STANDBY' | 'NEURALYZED';
  location: string;
  circuitPattern: string; // cyberpunk visual hash
}

export class MiBMTimeTracker {
  private states: MTimeState[] = [];
  private readonly MAX_STATES = 50; // Neuralyzer buffer limit
  private activeDangerTime: number = 0;
  
  // LCD Style Display Characters
  private readonly LCD_CHARS = {
    danger: ['▯', '▮', '◈', '◉'],
    neon: ['[36m', '[35m', '[31m', '[33m'], // Cyan, Magenta, Red, Yellow
    reset: '[0m'
  };

  /**
   * Track new dangerous field state
   * M-Protocol: Always Assume Infiltration
   */
  trackDangerState(
    dangerLevel: MTimeState['dangerLevel'],
    location: string,
    fieldStability: number = 50
  ): MTimeState {
    const state: MTimeState = {
      timestamp: Date.now(),
      dangerLevel,
      fieldStability: Math.max(0, Math.min(100, fieldStability)),
      temporalDistortion: this.calculateDistortion(dangerLevel),
      agentStatus: this.determineAgentStatus(dangerLevel),
      location,
      circuitPattern: this.generateCircuitPattern()
    };

    this.states.unshift(state);
    if (this.states.length > this.MAX_STATES) {
      this.states.pop(); // Neuralyzer oldest
    }

    this.activeDangerTime += state.temporalDistortion;
    return state;
  }

  /**
   * Retro-Futuristic LCD Display
   * Neon accents, cyberpunk circuit patterns
   */
  renderLCDDisplay(): string {
    const latest = this.states[0];
    if (!latest) return this.renderEmptyDisplay();

    const dangerIndex = ['LOW', 'ELEVATED', 'CRITICAL', 'SEVERE'].indexOf(latest.dangerLevel);
    const neonColor = this.LCD_CHARS.neon[dangerIndex] || this.LCD_CHARS.neon[0];
    const dangerIcon = this.LCD_CHARS.danger[dangerIndex] || '▯';
    
    const timestamp = new Date(latest.timestamp).toISOString();
    const stabilityBar = this.generateStabilityBar(latest.fieldStability);
    
    return `
╔════════════════════════════════════════════════╗
║  MiB M-TIME FIELD TRACKER v2.024              ║
║  [${latest.circuitPattern}]                          ║
╠════════════════════════════════════════════════╣
║ ${this.getColorForDanger(latest.dangerLevel)}DANGER: ${latest.dangerLevel.padEnd(12)}${this.LCD_CHARS.reset}              ║
║ LEVEL: ${dangerIcon.repeat(4)}                              ║
║                                                 ║
║ TIME:  ${timestamp}      ║
║                                                 ║
║ STABILITY: ${stabilityBar}                      ║
║ FIELD: ${latest.location.slice(0, 28).padEnd(28)}  ║
║                                                 ║
║ DISTORTION: ${latest.temporalDistortion}ms     AGENT: ${latest.agentStatus.padEnd(11)} ║
╚════════════════════════════════════════════════╝
`;
  }

  /**
   * Generate Cyberpunk Circuit Pattern
   * Visual hash for retro-futuristic aesthetic
   */
  private generateCircuitPattern(): string {
    const circuits = ['◢◣◤◥', '▚▞▚▞', '░▒░▒', '▓█▓█', '▛▜▛▜'];
    const pattern = circuits[Math.floor(Math.random() * circuits.length)];
    return `[36m${pattern}[0m`; // Cyan neon
  }

  /**
   * LCD Stability Bar with Neon Accents
   */
  private generateStabilityBar(stability: number): string {
    const filled = Math.floor(stability / 10);
    const empty = 10 - filled;
    const color = stability > 70 ? '\u001b[32m' : stability > 40 ? '\u001b[33m' : '\u001b[31m';
    return `${color}[${'▮'.repeat(filled)}${'▯'.repeat(empty)}] ${stability}%\u001b[0m`;
  }

  /**
   * Get ANSI color for danger level
   */
  private getColorForDanger(level: MTimeState['dangerLevel']): string {
    const colors = {
      'LOW': '\u001b[32m',      // Green
      'ELEVATED': '\u001b[33m', // Yellow
      'CRITICAL': '\u001b[31m', // Red
      'SEVERE': '\u001b[35m'    // Magenta
    };
    return colors[level] || '\u001b[0m';
  }

  private calculateDistortion(danger: MTimeState['dangerLevel']): number {
    const distortions = { 'LOW': 0, 'ELEVATED': 500, 'CRITICAL': 2000, 'SEVERE': 5000 };
    return distortions[danger];
  }

  private determineAgentStatus(danger: MTimeState['dangerLevel']): MTimeState['agentStatus'] {
    if (danger === 'SEVERE') return 'NEURALYZED';
    if (danger === 'CRITICAL') return 'ACTIVE';
    return 'STANDBY';
  }

  private renderEmptyDisplay(): string {
    return `
╔════════════════════════════════════════════════╗
║  MiB M-TIME FIELD TRACKER v2.024              ║
║  [◢◣◤◥] ALL CLEAR - NO ANOMALIES DETECTED     ║
╚════════════════════════════════════════════════╝`;
  }

  /**
   * Git-based Persistence
   * Commit dangerous field states
   */
  async commitToGit(commitMessage?: string): Promise<boolean> {
    try {
      const fs = require('fs');
      const path = require('path');
      const { execSync } = require('child_process');
      
      const dataPath = path.join(process.cwd(), 'mib_field_states.json');
      const data = {
        states: this.states,
        totalDangerTime: this.activeDangerTime,
        lastUpdate: new Date().toISOString(),
        agent: 'M'
      };
      
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      
      // Git commit
      execSync('git add mib_field_states.json', { stdio: 'ignore' });
      execSync(`git commit -m "${commitMessage || 'MiB: Field state update - Agent M'}" --quiet`, { 
        stdio: 'ignore' 
      });
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Danger Report
   * MiB Standard Format
   */
  getDangerReport(): {
    totalIncidents: number;
    totalDangerTime: number;
    highestLevel: MTimeState['dangerLevel'];
    locations: string[];
  } {
    if (this.states.length === 0) {
      return { totalIncidents: 0, totalDangerTime: 0, highestLevel: 'LOW', locations: [] };
    }

    const levels = ['LOW', 'ELEVATED', 'CRITICAL', 'SEVERE'];
    const levelIndices = this.states.map(s => levels.indexOf(s.dangerLevel));
    const maxLevelIndex = Math.max(...levelIndices);

    return {
      totalIncidents: this.states.length,
      totalDangerTime: this.activeDangerTime,
      highestLevel: levels[maxLevelIndex] as MTimeState['dangerLevel'],
      locations: [...new Set(this.states.map(s => s.location))]
    };
  }

  /**
   * Dispose: Clear all states (Neuralyzer)
   */
  dispose(): void {
    this.states = [];
    this.activeDangerTime = 0;
  }
}

export const miBTracker = new MiBMTimeTracker();
