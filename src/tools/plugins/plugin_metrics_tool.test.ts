import { describe, it, expect, beforeEach } from "vitest";
import { pluginMetricsTool, resetMetrics } from "./plugin_metrics_tool";

describe("plugin_metrics_tool (G9)", () => {
  beforeEach(() => {
    resetMetrics?.();
  });

  it("should have correct tool definition", () => {
    expect(pluginMetricsTool.definition.function.name).toBe("plugin_metrics");
    expect(pluginMetricsTool.definition.function.description).toContain("metrics");
  });

  it("should return metrics summary in text format", async () => {
    const result = await pluginMetricsTool.execute({});
    expect(result).toContain("Tool Metrics");
    expect(result).toContain("Total Executions");
  });

  it("should return metrics in JSON format", async () => {
    const result = await pluginMetricsTool.execute({ format: "json" });
    expect(() => JSON.parse(result)).not.toThrow();
    const data = JSON.parse(result);
    expect(data).toHaveProperty("totalExecutions");
    expect(data).toHaveProperty("toolUsage");
  });
});
