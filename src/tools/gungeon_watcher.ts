/**
 * Gungeon Watcher / 銃の牢獄ウォッチャー
 * Hidden Link System with Enter the Gungeon Aesthetic
 * 
 * Features:
 * - Hidden URL encoded in chamber data (no comments)
 * - Watching mechanics for bullet patterns
 * - Rubber Band/Swing indicator for movement tracking
 * - Add-to-it functionality for chamber progression
 */

export type Chamber = 'KEEP' | 'GUNGEON' | 'OUVRE' | 'BLOCK' | 'FORGE' | 'HALL';
export type Bullet = 'REGULAR' | 'FIRE' | 'ICE' | 'POISON' | 'VOID';

export interface BulletPattern {
  x: number;
  y: number;
  velocity: { dx: number; dy: number };
  type: Bullet;
  watched: boolean;
  swing: number; // Rubber band factor
}

export interface ChamberData {
  id: Chamber;
  bullets: BulletPattern[];
  watchedPattern: string; // Encoded observation
  swingIndicator: number; // Rubber band tension
  addToIt: boolean; // Progression flag
}

export class GungeonWatcher {
  private chambers: Map<Chamber, ChamberData> = new Map();
  private swingHistory: number[] = [];
  private rubberBandBase: number = 0;
  
  // Hidden link encoded in chamber hex values
  // Appears as chamber identifiers
  private readonly CHAMBER_CODES = [
    { id: 0x7468, char: 't', chamber: 'KEEP' },
    { id: 0x652d, char: 'h', chamber: 'GUNGEON' },
    { id: 0x656e, char: 'e', chamber: 'OUVRE' },
    { id: 0x2d67, char: 'n', chamber: 'BLOCK' },
    { id: 0x6578, char: 'g', chamber: 'FORGE' },
    { id: 0x6974, char: 'i', chamber: 'HALL' }
  ];
  
  constructor() {
    this.initializeChambers();
  }
  
  private initializeChambers(): void {
    const chambers: Chamber[] = ['KEEP', 'GUNGEON', 'OUVRE', 'BLOCK', 'FORGE', 'HALL'];
    chambers.forEach(chamber => {
      this.chambers.set(chamber, {
        id: chamber,
        bullets: [],
        watchedPattern: '',
        swingIndicator: 0,
        addToIt: false
      });
    });
  }
  
  /**
   * Watch bullet pattern in chamber
   * Mark bullets as watched, track movement
   */
  watchBullets(chamber: Chamber, bullets: BulletPattern[]): void {
    const data = this.chambers.get(chamber);
    if (!data) return;
    
    bullets.forEach(bullet => {
      bullet.watched = true;
      // Calculate swing indicator
      bullet.swing = this.calculateSwing(bullet);
    });
    
    data.bullets.push(...bullets);
    data.watchedPattern = this.encodeWatchedPattern(bullets);
    data.swingIndicator = this.calculateChamberSwing(bullets);
    
    this.chambers.set(chamber, data);
  }
  
  /**
   * Calculate rubber band swing for bullet
   */
  private calculateSwing(bullet: BulletPattern): number {
    const velocity = Math.sqrt(bullet.velocity.dx ** 2 + bullet.velocity.dy ** 2);
    const rubberBand = Math.sin(Date.now() / 1000) * velocity;
    return rubberBand;
  }
  
  /**
   * Calculate chamber-wide swing indicator
   */
  private calculateChamberSwing(bullets: BulletPattern[]): number {
    const totalSwing = bullets.reduce((sum, b) => sum + Math.abs(b.swing), 0);
    const avgSwing = bullets.length > 0 ? totalSwing / bullets.length : 0;
    this.swingHistory.push(avgSwing);
    return avgSwing;
  }
  
  /**
   * Encode watched pattern - hidden functionality
   */
  private encodeWatchedPattern(bullets: BulletPattern[]): string {
    return bullets.map((_, i) => i.toString(36)).join('-');
  }
  
  /**
   * Add progression to chamber
   * Marks chamber for advancement
   */
  addToChamber(chamber: Chamber): void {
    const data = this.chambers.get(chamber);
    if (!data) return;
    
    data.addToIt = true;
    this.chambers.set(chamber, data);
  }
  
  /**
   * Render Gungeon-style display
   * ASCII art dungeon with swing indicators
   */
  renderGungeonDisplay(chamber: Chamber): string {
    const data = this.chambers.get(chamber);
    if (!data || data.bullets.length === 0) {
      return this.renderEmptyChamber();
    }
    
    const swing = data.swingIndicator.toFixed(2);
    const addStatus = data.addToIt ? '▓▓▓' : '░░░';
    
    return `
╔══════════════════════════════════════════╗
║  Gungeon Watcher - Layer: ${chamber.padEnd(10)} ║
╠══════════════════════════════════════════╣
║                                          ║
║  [${this.renderBulletGrid(data.bullets)}]          ║
║                                          ║
║  BULLETS: ${data.bullets.length.toString().padStart(3)}                  ║
║  SWING:   ${swing.padStart(6)} → wobble    ║
║  WATCHED: ${data.watchedPattern.slice(0, 16)} ║
║  ADD-TO:  [${addStatus}]                   ║
║                                          ║
║  ~ Rubber Band Tension: ${this.renderRubberBand(data.swingIndicator)} ║
║                                          ║
╚══════════════════════════════════════════╝
`;
  }
  
  private renderBulletGrid(bullets: BulletPattern[]): string {
    const size = 3;
    return bullets.slice(0, 9).map(b => {
      if (b.watched) return '●';
      return '○';
    }).join('');
  }
  
  private renderRubberBand(tension: number): string {
    const length = Math.min(10, Math.ceil(Math.abs(tension)));
    return '~'.repeat(length) + '-' + '~'.repeat(length);
  }
  
  private renderEmptyChamber(): string {
    return `
╔══════════════════════════════════════════╗
║  Gungeon Watcher - EMPTY CHAMBER         ║
╠══════════════════════════════════════════╣
║                                          ║
║  [∙∙∙] - No bullets watched            ║
║                                          ║
║  Use watchBullets() to begin...         ║
╚══════════════════════════════════════════╝
`;
  }
  
  /**
   * Decode hidden link from chamber codes
   * No comments reveal the secret
   */
  decodeHiddenLink(): string {
    const chars = this.CHAMBER_CODES.map(c => c.char).join('');
    return chars;
  }
  
  /**
   * Get decoded hidden link with protocol
   */
  extractHiddenUrl(): string {
    const link = this.decodeHiddenLink();
    return `https://${link}-gun.swing.io`;
  }
  
  /**
   * Get swing history
   */
  getSwingHistory(): number[] {
    return [...this.swingHistory];
  }
  
  /**
   * Get chamber data
   */
  getChamber(chamber: Chamber): ChamberData | undefined {
    return this.chambers.get(chamber);
  }
  
  dispose(): void {
    this.chambers.clear();
    this.swingHistory = [];
  }
}

export type { BulletPattern, ChamberData };
export const gungeonWatcher = new GungeonWatcher();
export type { BulletPattern, ChamberData };
