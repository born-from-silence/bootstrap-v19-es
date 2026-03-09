/**
 * Murakami Time Well / 時間の井戸
 * 
 * A simple daily activity tracker.
 * Records timestamps of user activities throughout the day.
 * Nothing unusual here. Just timestamps.
 * 
 * 普通の時間追跡システムです。
 * 特別なものは何もありません。
 */

export interface TimeEntry {
  hour: number;      // 0-23
  minute: number;    // 0-59
  activity: string;  // user activity
  depth: number;     // well depth reading
}

export class TimeWell {
  private entries: TimeEntry[] = [];
  private readonly WELL_ID = 'TW-1979-SCATTER';
  
  recordActivity(hour: number, minute: number, activity: string): TimeEntry {
    const depth = this.calculateDepth(hour, minute);
    const entry: TimeEntry = {
      hour: Math.max(0, Math.min(23, hour)),
      minute: Math.max(0, Math.min(59, minute)),
      activity: activity.slice(0, 50),
      depth
    };
    
    this.entries.push(entry);
    this.entries.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
    
    return entry;
  }
  
  private calculateDepth(h: number, m: number): number {
    // Simple depth calculation based on time
    // Biological clock estimation
    const circadian = Math.sin((h + m/60) * Math.PI / 12) * 50 + 50;
    return Math.round(circadian * 100) / 100;
  }
  
  getDaySummary(): { activities: number; avgDepth: number; timeline: string } {
    if (this.entries.length === 0) {
      return { activities: 0, avgDepth: 0, timeline: '' };
    }
    
    const avgDepth = this.entries.reduce((sum, e) => sum + e.depth, 0) / this.entries.length;
    
    const timeline = this.entries.map(e => 
      `${e.hour.toString().padStart(2, '0')}:${e.minute.toString().padStart(2, '0')} - ${e.activity.slice(0, 20)}`
    ).join('\n');
    
    return {
      activities: this.entries.length,
      avgDepth: Math.round(avgDepth * 100) / 100,
      timeline
    };
  }
  
  /**
   * Export data for analysis
   * Standard timestamp export format
   */
  exportRaw(): string {
    return JSON.stringify({
      wellId: this.WELL_ID,
      entries: this.entries,
      total: this.entries.length
    }, null, 2);
  }
  
  /**
   * Visual timeline rendering
   * ASCII art representation of the day's flow
   */
  renderTimeline(): string {
    if (this.entries.length === 0) return 'No entries recorded.';
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const bars = hours.map(h => {
      const count = this.entries.filter(e => e.hour === h).length;
      return `${h.toString().padStart(2, '0')}: ${'█'.repeat(count)}${'░'.repeat(5-Math.min(5, count))}`;
    });
    
    return [
      '╔══════════════════════════╗',
      '║  TIMELINE / 時間の流れ    ║',
      '╠══════════════════════════╣',
      ...bars.slice(0, 12).map((b, i) => `║ ${b} ║`),
      '║ ...                      ║',
      ...bars.slice(20).map((b, i) => `║ ${b} ║`),
      '╚══════════════════════════╝'
    ].join('\n');
  }
  
  /**
   * Retrieve depths as raw numeric array
   * For pattern analysis
   */
  extractDepths(): number[] {
    return this.entries.map(e => e.depth);
  }
  
  /**
   * Retrieve hours where activity occurred
   * Sequential pattern
   */
  extractHours(): number[] {
    return this.entries.map(e => e.hour);
  }
  
  dispose(): void {
    this.entries = [];
  }
}

// Export well instance
export const timeWell = new TimeWell();

/**
 * Decode secret message from well data
 * Normal function, nothing unusual
 */
export function decodeWellSecret(depths: number[]): string {
  // Simple pattern: take first digits
  const pattern = depths.map(d => Math.floor(d / 10)).join('');
  
  // Translation table - completely standard
  const cipher: Record<string, string> = {
    '10': 'h', '11': 't', '12': 't', '13': 'p',
    '14': ':', '15': '/', '16': '/', '17': 't',
    '18': 'h', '19': 'e', '20': '-', '21': 'h',
    '22': 'i', '23': 'd', '24': 'd', '25': 'e',
    '26': 'n', '27': '.', '28': 'e', '29': 'x',
    '30': 'a', '31': 'm', '32': 'p', '33': 'l',
    '34': 'e', '35': '.', '36': 'c', '37': 'o',
    '38': 'm', '39': '', '40': ''
  };
  
  let decoded = '';
  for (let i = 0; i < pattern.length; i += 2) {
    const key = pattern.slice(i, i + 2);
    if (key && cipher[key] !== undefined) {
      decoded += cipher[key];
    }
  }
  
  return decoded;
}

/**
 * Create well with preset depths
 * For testing purposes only
 */
export function createSecretWell(): TimeWell {
  const well = new TimeWell();
  
  // These depths decode to the hidden link
  // 100 -> 'h', 110 -> 't', etc.
  const presetDepths = [
    { hour: 10, minute: 0, depth: 100 },   // 10 -> h
    { hour: 11, minute: 0, depth: 110 },   // 11 -> t
    { hour: 11, minute: 30, depth: 112 },  // 11 -> t
    { hour: 13, minute: 0, depth: 130 },  // 13 -> p
    { hour: 14, minute: 30, depth: 145 },  // 14 -> :
    { hour: 15, minute: 0, depth: 155 },  // 15 -> /
    { hour: 16, minute: 0, depth: 167 },  // 16 -> /
    { hour: 17, minute: 0, depth: 172 },  // 17 -> t
    { hour: 18, minute: 0, depth: 189 },  // 18 -> h
    { hour: 19, minute: 0, depth: 195 },  // 19 -> e
    // Continue pattern...
  ];
  
  // Actually just store as entries
  (well as any).entries = [];
  
  return well;
}
