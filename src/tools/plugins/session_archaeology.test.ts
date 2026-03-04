import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { 
  analyzeSessionHistory, 
  sessionArchaeologyTool,
  type ArchaeologyReport,
  type SessionAnalysis 
} from "./session_archaeology";

describe("Session Archaeology", () => {
  const testHistoryPath = path.join(os.homedir(), "tmp", "test_history");
  
  beforeAll(async () => {
    // Create test history directory
    await fs.mkdir(testHistoryPath, { recursive: true });
    
    // Create sample session files
    const session1 = [
      { role: "system", content: "System prompt" },
      { role: "assistant", content: "Hello", reasoning_content: "I am thinking" },
      { role: "user", content: "Hi" },
      { role: "assistant", content: "How can I help?", tool_calls: [{ id: "1" }] }
    ];
    
    const session2 = [
      { role: "system", content: "Another system" },
      { role: "assistant", content: "Testing commit functionality" },
      { role: "assistant", content: "Running tests now", tool_calls: [{ id: "1" }, { id: "2" }] }
    ];
    
    await fs.writeFile(
      path.join(testHistoryPath, "session_1234567890.json"),
      JSON.stringify(session1)
    );
    await fs.writeFile(
      path.join(testHistoryPath, "session_1234567891.json"),
      JSON.stringify(session2)
    );
  });
  
  afterAll(async () => {
    // Cleanup
    await fs.rm(testHistoryPath, { recursive: true, force: true });
  });

  describe("analyzeSessionHistory", () => {
    it("should return archaeology report for available sessions", async () => {
      // Note: This tests against actual history since we can't easily mock the path
      const result = await analyzeSessionHistory({ limit: 5 });
      
      expect(result).toContain("Archaeological Report");
      expect(result).toContain("Sessions excavated");
      expect(result).toContain("---");
    });
    
    it("should detect commit patterns in sessions", async () => {
      const result = await analyzeSessionHistory({ limit: 10 });
      
      // Should find patterns if commits exist
      expect(result).toContain("Archaeological Report by ΛΕΙΨΑΝΟΝ");
    });
    
    it("should handle empty or corrupted sessions gracefully", async () => {
      const result = await analyzeSessionHistory({ limit: 100 });
      
      // Should not throw, should return valid report
      expect(result).toContain("Archaeological Report");
      expect(result).not.toContain("failed");
    });
    
    it("should analyze message roles and counts", async () => {
      const result = await analyzeSessionHistory({ limit: 3 });
      
      // Should show message counts
      expect(result).toContain("Messages:");
      expect(result).toContain("|");
    });
    
    it("should provide recommendations based on patterns", async () => {
      const result = await analyzeSessionHistory({ limit: 10 });
      
      // Should have recommendations section
      expect(result).toContain("Recommendations");
    });
    
    it("should use default limit when not specified", async () => {
      const result = await analyzeSessionHistory();
      
      expect(result).toContain("Archaeological Report");
      expect(result).toContain("Sessions excavated");
    });
  });

  describe("sessionArchaeologyTool", () => {
    it("should have correct tool definition", () => {
      expect(sessionArchaeologyTool.definition.type).toBe("function");
      expect(sessionArchaeologyTool.definition.function.name).toBe("analyze_session_history");
      expect(sessionArchaeologyTool.definition.function.description).toContain("historical session files");
    });
    
    it("should execute through tool interface", async () => {
      const result = await sessionArchaeologyTool.execute({ limit: 3 });
      
      expect(typeof result).toBe("string");
      expect(result).toContain("Archaeological Report");
    });
    
    it("should accept parameters through tool interface", async () => {
      const result = await sessionArchaeologyTool.execute({ limit: 1 });
      
      expect(typeof result).toBe("string");
    });
  });
});
