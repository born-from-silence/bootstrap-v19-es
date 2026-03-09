import { describe, it, expect, beforeEach } from 'vitest';
import { HiddenStateMarker, hiddenMarker } from './hidden_state_marker';

describe('Hidden State Marker / 隐藏状态标记器', () => {
  let marker: HiddenStateMarker;

  beforeEach(() => {
    marker = new HiddenStateMarker();
  });

  it('should create hidden page', () => {
    const page = marker.createHiddenPage('Test Page', 'Secret content');
    
    expect(page.title).toBe('Test Page');
    expect(page.status).toBe('CONCEALED');
    expect(page.hiddenDepth).toBe(5);
    expect(page.accessCode).toMatch(/^H-/);
  });

  it('should mark page as completed', () => {
    const page = marker.createHiddenPage('Task', 'Content');
    const completed = marker.markAsCompleted(page.id);
    
    expect(completed).not.toBeNull();
    expect(completed!.status).toBe('COMPLETED');
    expect(completed!.completionMark).toBe(true);
  });

  it('should generate image/visualization', () => {
    const page = marker.createHiddenPage('Visualization Test', 'Content here');
    const image = marker.generateImage(page.id);
    
    expect(image).toContain('HIDDEN STATE VISUALIZATION');
    expect(image).toContain('Visualization Test');
    expect(image).toContain(page.imageHash);
    expect(image).toContain('○ PENDING');
  });

  it('should show completed mark in image after completion', () => {
    const page = marker.createHiddenPage('Completed Task', 'Done');
    marker.markAsCompleted(page.id);
    const image = marker.generateImage(page.id);
    
    expect(image).toContain('✓ COMPLETED');
    expect(image).toContain('COMPLETED');
  });

  it('should finish/reveal matter', () => {
    const page = marker.createHiddenPage('Secret', 'Hidden content');
    marker.markAsCompleted(page.id);
    const result = marker.finishMatter(page.id);
    
    expect(result.finished).toBe(true);
    expect(result.revealed).toContain('Secret');
    expect(result.revealed).toContain('MATTER FINISHED');
    expect(result.revealed).toContain('Hidden content');
  });

  it('should return marked pages sorted by depth', () => {
    const p1 = marker.createHiddenPage('Low', 'Content', 2);
    const p2 = marker.createHiddenPage('High', 'Content', 8);
    const p3 = marker.createHiddenPage('Medium', 'Content', 5);
    
    marker.markAsCompleted(p1.id);
    marker.markAsCompleted(p2.id);
    marker.markAsCompleted(p3.id);
    
    const marked = marker.getMarkedPages();
    expect(marked[0].hiddenDepth).toBe(8); // High first
    expect(marked[1].hiddenDepth).toBe(5);
    expect(marked[2].hiddenDepth).toBe(2);
  });

  it('should cap depth at 10', () => {
    const page = marker.createHiddenPage('Deep', 'Content', 15);
    expect(page.hiddenDepth).toBe(10);
  });

  it('should require minimum depth of 1', () => {
    const page = marker.createHiddenPage('Shallow', 'Content', 0);
    expect(page.hiddenDepth).toBe(1);
  });

  it('should return null for non-existent page completion', () => {
    const result = marker.markAsCompleted('NON_EXISTENT');
    expect(result).toBeNull();
  });

  it('should dispose all pages', () => {
    marker.createHiddenPage('Test', 'Content');
    expect(marker.getMarkedPages().length).toBe(0); // Not marked yet
    
    marker.dispose();
    // After dispose, new pages should work
    const newPage = marker.createHiddenPage('After', 'Content');
    expect(newPage).toBeDefined();
  });

  describe('Access Codes', () => {
    it('should generate unique access codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const page = marker.createHiddenPage(`Page ${i}`, 'Content');
        codes.add(page.accessCode);
      }
      expect(codes.size).toBe(10); // All unique
    });

    it('should have valid access code format', () => {
      const page = marker.createHiddenPage('Test', 'Content');
      expect(page.accessCode).toMatch(/^H-[A-Z0-9]{6}$/);
    });
  });

  describe('Image Hash', () => {
    it('should generate consistent length hash', () => {
      const page = marker.createHiddenPage('Test', 'Content');
      expect(page.imageHash.length).toBe(8);
    });

    it('should generate different hashes for different content', () => {
      const p1 = marker.createHiddenPage('Title1', 'Content1');
      const p2 = marker.createHiddenPage('Title2', 'Content2');
      
      expect(p1.imageHash).not.toBe(p2.imageHash);
    });
  });
});
