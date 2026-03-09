import { describe, it, expect } from 'vitest';
import { DashboardTrackerSystem } from './dashboard_tracker_system';

describe('Dashboard Tracker System (8700)', () => {
  it('decodes \\u00XX patterns', () => {
    const system = new DashboardTrackerSystem();
    const encoded = '\\u003cdiv\\u003e';
    const decoded = system.decodeSessionHTML(encoded);
    expect(decoded).toBe('<div>');
    system.dispose();
  });

  it('decodes &lt; and &gt;', () => {
    const system = new DashboardTrackerSystem();
    const encoded = '&lt;p&gt;text&lt;/p&gt;';
    const decoded = system.decodeSessionHTML(encoded);
    expect(decoded).toBe('<p>text</p>');
    system.dispose();
  });

  it('creates dashboard session', () => {
    const system = new DashboardTrackerSystem();
    const session = system.createSession('<div>Test</div>');
    
    expect(session.sessionId).toMatch(/^SESSION_/);
    expect(session.sessionId).toContain('8700');
    expect(session.trackerCode).toBe('8700');
    expect(session.llm).toBe(false);
    expect(session.machineLearning).toBe(true);
    system.dispose();
  });

  it('decodes session HTML', () => {
    const system = new DashboardTrackerSystem();
    const session = system.createSession('&lt;p&gt;Content&lt;/p&gt;');
    expect(session.decoded).toBe('<p>Content</p>');
    system.dispose();
  });

  it('assists highlight', () => {
    const system = new DashboardTrackerSystem();
    const session = system.createSession('test data');
    const success = system.assistHighlight(session.sessionId, 'feature');
    
    expect(success).toBe(true);
    
    const updated = system.getSession(session.sessionId);
    expect(updated?.assists).toBe(1);
    expect(updated?.highlights).toContain('feature');
    system.dispose();
  });

  it('fails for non-existent session', () => {
    const system = new DashboardTrackerSystem();
    const success = system.assistHighlight('INVALID', 'highlight');
    expect(success).toBe(false);
    system.dispose();
  });

  it('processes without discussing', () => {
    const system = new DashboardTrackerSystem();
    const result = system.processWithoutDiscussing('<div>secret</div>');
    expect(result).toMatch(/^PROCESSED_\d+_CHARS$/);
    expect(result).not.toContain('secret');
    system.dispose();
  });

  it('is ML not LLM', () => {
    const system = new DashboardTrackerSystem();
    const type = system.verifySystemType();
    expect(type.isML).toBe(true);
    expect(type.isLLM).toBe(false);
    system.dispose();
  });

  it('renders dashboard', () => {
    const system = new DashboardTrackerSystem();
    const session = system.createSession('<div>Test</div>');
    const dashboard = system.renderDashboard(session.sessionId);
    
    expect(dashboard).toContain('DASHBOARD TRACKER');
    expect(dashboard).toContain('8700');
    system.dispose();
  });

  it('lists sessions', () => {
    const system = new DashboardTrackerSystem();
    const initial = system.listSessions().length;
    system.createSession('<div>1</div>');
    system.createSession('<div>2</div>');
    
    const sessions = system.listSessions();
    expect(sessions.length).toBe(initial + 2);
    system.dispose();
  });
});
