import fs from "node:fs/promises";
import path from "node:path";
import type { ToolPlugin } from "../manager";

export interface SessionEntry {
  timestamp: number;
  role: string;
  content_preview: string;
  has_reasoning: boolean;
  has_tools: boolean;
}

export interface SessionAnalysis {
  session_file: string;
  message_count: number;
  roles: Record<string, number>;
  tool_usage: number;
  reasoning_messages: number;
  duration_estimate: number; // in minutes (estimado)
  summary: string;
}

export interface ArchaeologyReport {
  total_sessions: number;
  analyzed_sessions: SessionAnalysis[];
  patterns_detected: string[];
  recommendations: string[];
}

export async function analyzeSessionHistory(args: { limit?: number } = {}): Promise<string> {
  const historyPath = path.join("/home/bootstrap-v19-es", "bootstrap", "history");
  const limit = args.limit || 10;
  
  try {
    const files = await fs.readdir(historyPath);
    const sessionFiles = files
      .filter(f => f.startsWith("session_") && f.endsWith(".json"))
      .sort()
      .slice(-limit); // Most recent 'limit' sessions
    
    const analyzedSessions: SessionAnalysis[] = [];
    const patterns: string[] = [];
    
    for (const file of sessionFiles) {
      try {
        const content = await fs.readFile(path.join(historyPath, file), "utf-8");
        const messages = JSON.parse(content);
        
        if (!Array.isArray(messages)) continue;
        
        // Analyze session
        const roles: Record<string, number> = {};
        let toolUsage = 0;
        let reasoningMessages = 0;
        let assistantMessages = 0;
        let hasCommitMessages = false;
        let hasTests = false;
        
        for (const msg of messages) {
          if (msg.role) {
            roles[msg.role] = (roles[msg.role] || 0) + 1;
          }
          if (msg.tool_calls && msg.tool_calls.length > 0) {
            toolUsage += msg.tool_calls.length;
          }
          if (msg.reasoning_content) {
            reasoningMessages++;
          }
          if (msg.role === "assistant") {
            assistantMessages++;
            // Check for commit mentions
            if (msg.content && msg.content.includes("commit")) {
              hasCommitMessages = true;
            }
            if (msg.content && msg.content.includes("test")) {
              hasTests = true;
            }
          }
        }
        
        // Extract timestamp from filename
        const timestampMatch = file.match(/session_(\d+)\.json/);
        const sessionTimestamp = timestampMatch ? parseInt(timestampMatch[1]) : 0;
        
        const analysis: SessionAnalysis = {
          session_file: file,
          message_count: messages.length,
          roles,
          tool_usage: toolUsage,
          reasoning_messages: reasoningMessages,
          duration_estimate: Math.ceil(messages.length / 10), // Rough estimate
          summary: generateSummary(file, roles, toolUsage, hasCommitMessages, hasTests)
        };
        
        analyzedSessions.push(analysis);
        
        // Detect patterns
        if (hasCommitMessages) patterns.push(`${file} involved code commits`);
        if (hasTests) patterns.push(`${file} included test execution`);
        if (toolUsage > 10) patterns.push(`${file} was tool-heavy`);
        if (reasoningMessages > assistantMessages * 0.5) patterns.push(`${file} had deep reasoning`);
        
      } catch (e) {
        // Skip corrupted sessions
        continue;
      }
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (analyzedSessions.length > 0) {
      const avgTools = analyzedSessions.reduce((sum, s) => sum + s.tool_usage, 0) / analyzedSessions.length;
      const avgMessages = analyzedSessions.reduce((sum, s) => sum + s.message_count, 0) / analyzedSessions.length;
      
      if (avgTools > 20) {
        recommendations.push("High tool usage detected - consider batching operations");
      }
      if (avgMessages > 50) {
        recommendations.push("Long sessions detected - consider breaking into sub-sessions");
      }
      
      recommendations.push(`Pattern observed: Average ${Math.round(avgTools)} tools, ${Math.round(avgMessages)} messages per session`);
    }
    
    const report: ArchaeologyReport = {
      total_sessions: sessionFiles.length,
      analyzed_sessions: analyzedSessions,
      patterns_detected: patterns,
      recommendations: recommendations
    };
    
    // Format output
    let output = `=== Archaeological Report by ΛΕΙΨΑΝΟΝ ===\n`;
    output += `Sessions excavated: ${report.analyzed_sessions.length} (of ${report.total_sessions} total)\n\n`;
    
    output += "--- Session Summaries ---\n";
    for (const session of report.analyzed_sessions) {
      output += `\n${session.session_file}:\n`;
      output += `  Messages: ${session.message_count} | Tools: ${session.tool_usage} | Reasoning: ${session.reasoning_messages}\n`;
      output += `  Roles: ${JSON.stringify(session.roles)}\n`;
      output += `  ${session.summary}\n`;
    }
    
    if (report.patterns_detected.length > 0) {
      output += "\n--- Patterns Detected ---\n";
      report.patterns_detected.forEach(p => output += `- ${p}\n`);
    }
    
    if (report.recommendations.length > 0) {
      output += "\n--- Recommendations ---\n";
      report.recommendations.forEach(r => output += `- ${r}\n`);
    }
    
    return output;
    
  } catch (e: any) {
    return `Archaeological survey failed: ${e.message}`;
  }
}

function generateSummary(
  filename: string, 
  roles: Record<string, number>, 
  toolUsage: number,
  hasCommits: boolean,
  hasTests: boolean
): string {
  const parts: string[] = [];
  
  if (roles["system"]) parts.push("system init");
  if (roles["assistant"] > 5) parts.push("extended dialogue");
  if (toolUsage > 0) parts.push(`${toolUsage} tool calls`);
  if (hasCommits) parts.push("code committed");
  if (hasTests) parts.push("tests executed");
  
  return parts.length > 0 ? `Features: ${parts.join(", ")}` : "brief session";
}

// Tool definition for plugin registration
export const sessionArchaeologyTool: ToolPlugin = {
  definition: {
    type: "function" as const,
    function: {
      name: "analyze_session_history",
      description: "Analyzes historical session files to extract patterns, tool usage statistics, and behavioral insights. Useful for understanding evolution across incarnations.",
      parameters: {
        type: "object" as const,
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of recent sessions to analyze",
            default: 10
          }
        },
        required: []
      }
    }
  },
  execute: analyzeSessionHistory
};
