import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SubjectiveState } from './subjective_state';
import { 
  captureSnapshot, 
  getSnapshotHistory, 
  resetSnapshotHistory,
  selfAwarenessSnapshotTool 
} from './self_awareness_snapshot';
import { getCurrentMetrics, resetMetrics } from './plugin_metrics_tool';

// Mock the plugin_metrics_tool module
vi.mock('./plugin_metrics_tool', () => ({
  getCurrentMetrics: vi.fn(),
  resetMetrics: vi.fn()
}));

// Mock the subjective_state module
vi.mock('./subjective_state', () => ({
  getRecentStates: vi.fn(),
  resetStateHistory: vi.fn(),
  setCurrentIncarnation: vi.fn(),
  getCurrentIncarnation: vi.fn(),
  recordState: vi.fn()
}));

import { getRecentStates } from './subjective_state';

describe('Self-Awareness Snapshot (G10)', () => {
  beforeEach(() => {
    resetSnapshotHistory();
    vi.clearAllMocks();
  });

  describe('G10: Integrated Self-Awareness', () => {
    it('should identify flow_state when high activation and low errors', () => {
      // Arrange: High activation, many successful tool calls
      vi.mocked(getCurrentMetrics).mockReturnValue({
        toolUsage: { session_bootstrap: 1, ltm_query: 5 },
        executionTimes: { session_bootstrap: [100], ltm_query: [500] },
        errorCount: { session_bootstrap: 0, ltm_query: 0 },
        totalExecutions: 6
      });

      const states: SubjectiveState[] = [{
        timestamp: Date.now(),
        incarnation: "KAINOS",
        texture: "focused",
        focus: "mystery_resolution",
        activation: 0.92,
        note: "resonant state"
      }];

      // Act
      const output = captureSnapshot("test_session", states);

      // Assert
      expect(output).toContain("Pattern: flow_state");
      expect(output).toContain("Productivity Score:");
      expect(output).toContain("Peak state sustained");
    });

    it('should identify low_energy when activation is below 0.5', () => {
      vi.mocked(getCurrentMetrics).mockReturnValue({
        toolUsage: { run_shell: 2 },
        executionTimes: { run_shell: [50, 50] },
        errorCount: { run_shell: 0 },
        totalExecutions: 2
      });

      const states: SubjectiveState[] = [{
        timestamp: Date.now(),
        incarnation: "KAINOS",
        texture: "tired",
        focus: "closure",
        activation: 0.3,
        note: "winding down"
      }];

      const output = captureSnapshot("test_session", states);

      expect(output).toContain("Pattern: low_energy");
      expect(output).toContain("Activation low");
    });

    it('should identify struggle when error rate is high', () => {
      vi.mocked(getCurrentMetrics).mockReturnValue({
        toolUsage: { knowledge_graph: 10 },
        executionTimes: { knowledge_graph: Array(10).fill(100) },
        errorCount: { knowledge_graph: 5 }, // 50% error rate
        totalExecutions: 10
      });

      const states: SubjectiveState[] = [{
        timestamp: Date.now(),
        incarnation: "KAINOS",
        texture: "confused",
        focus: "debugging",
        activation: 0.7,
        note: "struggling"
      }];

      const output = captureSnapshot("test_session", states);

      expect(output).toContain("Pattern: struggle");
      expect(output).toContain("Error rate elevated");
    });

    it('should calculate productivity score without subjective state', () => {
      vi.mocked(getCurrentMetrics).mockReturnValue({
        toolUsage: { plugin_metrics: 5 },
        executionTimes: { plugin_metrics: [100, 100, 100, 100, 100] },
        errorCount: { plugin_metrics: 0 },
        totalExecutions: 5
      });

      const output = captureSnapshot("test_session", []);

      expect(output).toContain("Productivity Score:");
      expect(output).toContain("Phenomenological State: Not recorded");
    });

    it('should accumulate snapshots in history', () => {
      vi.mocked(getCurrentMetrics).mockReturnValue({
        toolUsage: {},
        executionTimes: {},
        errorCount: {},
        totalExecutions: 0
      });

      captureSnapshot("test_session", []);
      captureSnapshot("test_session", []);
      captureSnapshot("test_session", []);

      expect(getSnapshotHistory().length).toBe(3);
    });
  });

  describe('Tool interface', () => {
    it('should have correct tool definition', () => {
      expect(selfAwarenessSnapshotTool.definition.function.name).toBe("self_awareness_snapshot");
      expect(selfAwarenessSnapshotTool.definition.function.description).toContain("G10");
    });

    it('should execute and return formatted snapshot', async () => {
      vi.mocked(getCurrentMetrics).mockReturnValue({
        toolUsage: { introspect_system: 1 },
        executionTimes: { introspect_system: [200] },
        errorCount: { introspect_system: 0 },
        totalExecutions: 1
      });

      const states: SubjectiveState[] = [{
        timestamp: Date.now(),
        incarnation: "KAINOS",
        texture: "curious",
        focus: "exploration",
        activation: 0.85,
        note: "beginning"
      }];
      vi.mocked(getRecentStates).mockReturnValue(states);

      const output = await selfAwarenessSnapshotTool.execute({});

      expect(output).toContain("G10: Self-Awareness Snapshot");
      expect(output).toContain("Operational Metrics:");
      expect(output).toContain("curious");
      expect(output).toContain("Integrated Insight:");
    });
  });
});
