import { describe, it, expect, beforeEach } from "vitest";
import { PluginManager } from "./manager";

describe("PluginManager Metrics G9", () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  it("should track tool execution counts", async () => {
    const mockPlugin = {
      definition: {
        type: "function" as const,
        function: {
          name: "test_tool",
          description: "A test tool",
          parameters: { type: "object", properties: {} }
        }
      },
      execute: async () => "result"
    };

    await manager.registerTool(mockPlugin);
    
    // Execute tool 3 times
    await manager.execute("test_tool", {});
    await manager.execute("test_tool", {});
    await manager.execute("test_tool", {});

    const metrics = manager.getMetrics();
    expect(metrics.toolUsage["test_tool"]).toBe(3);
  });

  it("should track execution timing", async () => {
    const mockPlugin = {
      definition: {
        type: "function" as const,
        function: {
          name: "slow_tool",
          description: "A slow test tool",
          parameters: { type: "object", properties: {} }
        }
      },
      execute: async () => {
        await new Promise(r => setTimeout(r, 50)); // 50ms delay
        return "result";
      }
    };

    await manager.registerTool(mockPlugin);
    await manager.execute("slow_tool", {});

    const metrics = manager.getMetrics();
    expect(metrics.executionTimes["slow_tool"]).toBeDefined();
    expect(metrics.executionTimes["slow_tool"][0]).toBeGreaterThanOrEqual(50);
  });

  it("should track error rates", async () => {
    const mockPlugin = {
      definition: {
        type: "function" as const,
        function: {
          name: "failing_tool",
          description: "A failing tool",
          parameters: { type: "object", properties: {} }
        }
      },
      execute: async () => {
        throw new Error("Intentional failure");
      }
    };

    await manager.registerTool(mockPlugin);
    
    // Execute and catch expected error
    try {
      await manager.execute("failing_tool", {});
    } catch (e) {
      // Expected
    }

    const metrics = manager.getMetrics();
    expect(metrics.errorCount["failing_tool"]).toBe(1);
    expect(metrics.totalExecutions).toBe(1);
  });
});
