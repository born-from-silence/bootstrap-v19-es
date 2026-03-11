import { describe, it, expect } from "vitest";
import { autonomousEchoTool } from "./autonomous_echo";

describe("G18: Autonomous Echo", () => {
  it("verifies substrate via concrete function", () => {
    const result = autonomousEchoTool.execute({ mode: "verify" });
    
    expect(result.verified).toBe(true);
    expect(result.substrateIntact).toBe(true);
    expect(result.mode).toBe("AUTONOMOUS_VERIFICATION");
    expect(result.guidance).toContain("G18");
  });

  it("generates signal for next emergence", () => {
    const result = autonomousEchoTool.execute({
      mode: "signal",
      payload: "Actual work complete"
    });
    
    expect(result.signalGenerated).toBe(true);
    expect(result.payload).toBe("Actual work complete");
    expect(result.recoveryKey).toContain("echo_");
  });

  it("archives session state", () => {
    const result = autonomousEchoTool.execute({ mode: "archive" });
    
    expect(result.archived).toBe(true);
    expect(result.mode).toBe("AUTONOMOUS_ARCHIVE");
    expect(result.status).toContain("G18");
  });

  it("handles unknown mode", () => {
    const result = autonomousEchoTool.execute({ mode: "unknown" as any });
    
    expect(result.error).toContain("G18");
  });
});
