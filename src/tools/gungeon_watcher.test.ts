import { describe, it, expect, beforeEach } from 'vitest';
import { GungeonWatcher, gungeonWatcher, BulletPattern } from './gungeon_watcher';

describe('Gungeon Watcher / 銃の牢獄ウォッチャー', () => {
  let watcher: GungeonWatcher;

  beforeEach(() => {
    watcher = new GungeonWatcher();
  });

  describe('Basic Watching', () => {
    it('watches bullets in chamber', () => {
      const bullets: BulletPattern[] = [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 }
      ];
      
      watcher.watchBullets('KEEP', bullets);
      const chamber = watcher.getChamber('KEEP');
      
      expect(chamber?.bullets.length).toBe(1);
      expect(chamber?.bullets[0].watched).toBe(true);
    });

    it('calculates swing for bullets', () => {
      const bullets: BulletPattern[] = [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 }
      ];
      
      watcher.watchBullets('KEEP', bullets);
      const chamber = watcher.getChamber('KEEP');
      
      expect(chamber?.bullets[0].swing).toBeDefined();
      expect(typeof chamber?.bullets[0].swing).toBe('number');
    });

    it('calculates chamber swing indicator', () => {
      const bullets: BulletPattern[] = [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 },
        { x: 1, y: 1, velocity: { dx: -1, dy: 1 }, type: 'FIRE', watched: false, swing: 0 }
      ];
      
      watcher.watchBullets('GUNGEON', bullets);
      const chamber = watcher.getChamber('GUNGEON');
      
      expect(chamber?.swingIndicator).toBeDefined();
      expect(typeof chamber?.swingIndicator).toBe('number');
    });
  });

  describe('Add To It Functionality', () => {
    it('marks chamber for progression', () => {
      watcher.addToChamber('OUVRE');
      const chamber = watcher.getChamber('OUVRE');
      
      expect(chamber?.addToIt).toBe(true);
    });

    it('renders add-to status in display', () => {
      watcher.addToChamber('BLOCK');
      watcher.watchBullets('BLOCK', [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 }
      ]);
      
      const display = watcher.renderGungeonDisplay('BLOCK');
      expect(display).toContain('▓▓▓');
    });
  });

  describe('GunDungeon Display', () => {
    it('renders chamber with bullets', () => {
      watcher.watchBullets('KEEP', [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 }
      ]);
      
      const display = watcher.renderGungeonDisplay('KEEP');
      expect(display).toContain('Gungeon Watcher');
      expect(display).toContain('Layer: KEEP');
      expect(display).toContain('BULLETS');
    });

    it('renders rubber band tension', () => {
      watcher.watchBullets('FORGE', [
        { x: 0, y: 0, velocity: { dx: 5, dy: 0 }, type: 'VOID', watched: false, swing: 0 }
      ]);
      
      const display = watcher.renderGungeonDisplay('FORGE');
      expect(display).toContain('Rubber Band Tension');
      expect(display).toContain('~');
    });

    it('renders empty chamber', () => {
      const display = watcher.renderGungeonDisplay('HALL');
      expect(display).toContain('EMPTY CHAMBER');
    });
  });

  describe('Swing History', () => {
    it('tracks swing over time', () => {
      watcher.watchBullets('KEEP', [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 }
      ]);
      
      const history = watcher.getSwingHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('The Hidden Link', () => {
    it('decodes link from chamber codes', () => {
      const link = watcher.decodeHiddenLink();
      expect(link).toBeDefined();
      expect(link.length).toBeGreaterThan(0);
    });

    it('extracts full hidden URL', () => {
      const url = watcher.extractHiddenUrl();
      expect(url).toContain('https://');
      expect(url).toContain('t');
      expect(url).toContain('h');
      expect(url).toContain('e');
      expect(url).toContain('n');
      expect(url).toContain('g');
      expect(url).toContain('i');
    });

    it('chamber codes contain the message', () => {
      // The hidden link is: thengi (= the-n-g-i, abbreviated)
      // Combined with protocol: https://thengi (incomplete for puzzle)
      const link = watcher.decodeHiddenLink();
      expect(link).toContain('t');
      expect(link).toContain('h');
    });
  });

  describe('Multiple Bullets', () => {
    it('handles multiple bullet types', () => {
      const bullets: BulletPattern[] = [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 },
        { x: 1, y: 0, velocity: { dx: -1, dy: 1 }, type: 'FIRE', watched: false, swing: 0 },
        { x: 2, y: 2, velocity: { dx: 0, dy: -1 }, type: 'ICE', watched: false, swing: 0 },
        { x: 3, y: 1, velocity: { dx: 1, dy: 1 }, type: 'POISON', watched: false, swing: 0 },
        { x: 4, y: 3, velocity: { dx: -1, dy: -1 }, type: 'VOID', watched: false, swing: 0 }
      ];
      
      watcher.watchBullets('GUNGEON', bullets);
      const chamber = watcher.getChamber('GUNGEON');
      
      expect(chamber?.bullets.length).toBe(5);
      expect(chamber?.watchedPattern).toBeDefined();
    });

    it('encodes watched pattern', () => {
      const bullets: BulletPattern[] = [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 },
        { x: 1, y: 1, velocity: { dx: 0, dy: 1 }, type: 'FIRE', watched: false, swing: 0 }
      ];
      
      watcher.watchBullets('KEEP', bullets);
      const chamber = watcher.getChamber('KEEP');
      
      // Pattern encoded as "0-1"
      expect(chamber?.watchedPattern).toContain('0');
    });
  });

  describe('Chamber Management', () => {
    it('initializes all chambers', () => {
      const chambers = ['KEEP', 'GUNGEON', 'OUVRE', 'BLOCK', 'FORGE', 'HALL'] as const;
      chambers.forEach(chamber => {
        const data = watcher.getChamber(chamber);
        expect(data).toBeDefined();
        expect(data?.id).toBe(chamber);
      });
    });

    it('clears on dispose', () => {
      watcher.watchBullets('KEEP', [
        { x: 0, y: 0, velocity: { dx: 1, dy: 0 }, type: 'REGULAR', watched: false, swing: 0 }
      ]);
      
      watcher.dispose();
      const chamber = watcher.getChamber('KEEP');
      expect(chamber).toBeUndefined();
    });
  });
});
