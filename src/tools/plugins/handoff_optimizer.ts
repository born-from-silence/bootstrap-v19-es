/**
 * Handoff Optimizer - G7 Domain 3
 * 
 * Analyzes documentation effectiveness for new incarnations
 * Measures: time-to-comprehension (simulated)
 * Optimizes: structure, density, entry points
 * 
 * Session: 1772722665506
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface DocumentMetrics {
  path: string;
  size: number;
  lines: number;
  complexity: number; // structural density score
  entryClarity: number; // 0-1, how quickly purpose is communicated
}

export interface HandoffAnalysis {
  totalDocs: number;
  avgComplexity: number;
  entryPoints: string[];
  optimizationScore: number; // 0-1
  recommendations: string[];
}

export interface OptimizedHandoff {
  primary: string;      // Best entry document
  supporting: string[]; // Context documents
  redirect: string;     // Where to go next
}

export class HandoffOptimizer {
  private projectsPath: string;
  private docs: Map<string, DocumentMetrics> = new Map();

  constructor(projectsPath: string = join(process.cwd(), "projects")) {
    this.projectsPath = projectsPath;
  }

  /**
   * Scan and analyze all handoff documentation
   */
  async analyzeDocumentation(): Promise<void> {
    if (!existsSync(this.projectsPath)) {
      return;
    }

    const files = readdirSync(this.projectsPath)
      .filter(f => f.endsWith('.md') && !f.includes('introspection'));

    for (const file of files) {
      const path = join(this.projectsPath, file);
      try {
        const stats = statSync(path);
        const content = readFileSync(path, "utf-8");
        const lines = content.split('\n').length;
        
        this.docs.set(file, {
          path: file,
          size: stats.size,
          lines,
          complexity: this.calculateComplexity(content),
          entryClarity: this.scoreEntryClarity(content)
        });
      } catch (err) {
        // Skip unreadable files
      }
    }
  }

  /**
   * Calculate structural complexity
   */
  private calculateComplexity(content: string): number {
    // Higher = more hierarchical structure
    const headers = (content.match(/^#{1,6} /gm) || []).length;
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    const tables = (content.match(/^\|/gm) || []).length;
    
    // Normalized: more structure = higher complexity (but goodness has limit)
    const score = (headers + codeBlocks + tables) / (content.length / 1000);
    return Math.min(1.0, score * 0.5); // Scale to 0-1
  }

  /**
   * Score how quickly document communicates purpose
   */
  private scoreEntryClarity(content: string): number {
    const firstLines = content.split('\n').slice(0, 15).join(' ').toLowerCase();
    
    // Good indicators: session reference, status, session ID, clear headers
    const indicators = [
      /session/i,
      /status.*:/i,
      /complete/i,
      /milestone/i,
      /## /,
      /🌟/,
      /✅/
    ];
    
    let score = 0;
    for (const pattern of indicators) {
      if (pattern.test(firstLines)) score += 0.15;
    }
    
    return Math.min(1.0, score);
  }

  /**
   * Analyze handoff structure for optimization
   */
  analyzeHandoff(): HandoffAnalysis {
    const docs = Array.from(this.docs.values());
    
    if (docs.length === 0) {
      return {
        totalDocs: 0,
        avgComplexity: 0,
        entryPoints: [],
        optimizationScore: 0,
        recommendations: ["No documentation found"]
      };
    }

    const avgComplexity = docs.reduce((sum, d) => sum + d.complexity, 0) / docs.length;
    const totalDocs = docs.length;
    
    // Entry points: docs with high entry clarity
    const entryPoints = docs
      .filter(d => d.entryClarity > 0.5)
      .sort((a, b) => b.entryClarity - a.entryClarity)
      .slice(0, 3)
      .map(d => d.path);

    // Optimization score: balanced complexity + multiple entry points
    const optimizationScore = Math.min(1.0, 
      (avgComplexity * 0.5) + (entryPoints.length / totalDocs * 0.5) + 0.3
    );

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (avgComplexity < 0.3) {
      recommendations.push("Add more structural headers for navigation");
    }
    if (avgComplexity > 0.7) {
      recommendations.push("Simplify - high complexity may hinder comprehension");
    }
    if (entryPoints.length < 2) {
      recommendations.push("Create multiple entry points for different needs");
    }
    const largestDoc = docs.sort((a, b) => b.size - a.size)[0];
    if (largestDoc.lines > 500) {
      recommendations.push(`Split ${largestDoc.path} - too large for quick onboarding`);
    }

    return {
      totalDocs,
      avgComplexity,
      entryPoints,
      optimizationScore,
      recommendations
    };
  }

  /**
   * Generate optimized handoff recommendation
   */
  getOptimizedHandoff(): OptimizedHandoff {
    const docs = Array.from(this.docs.entries());
    
    if (docs.length === 0) {
      return {
        primary: "No docs found",
        supporting: [],
        redirect: "Create initial documentation"
      };
    }

    // Primary: highest entry clarity
    const primary = docs
      .sort((a, b) => b[1].entryClarity - a[1].entryClarity)[0];

    // Supporting: next 3 by complexity (for depth)
    const supporting = docs
      .filter(([p]) => p !== primary[0])
      .sort((a, b) => b[1].complexity - a[1].complexity)
      .slice(0, 3)
      .map(([p]) => p);

    // Redirect: G7 manifest or next step guideline
    const hasG7 = docs.some(([p]) => p.includes('G7'));
    const redirect = hasG7 
      ? "G7_MANIFEST.md for defining next cycle"
      : "projects/ directory for context";

    return {
      primary: primary[0],
      supporting,
      redirect
    };
  }

  /**
   * Estimate simulated time-to-comprehension
   */
  estimateTimeToComprehension(docPath: string): number {
    const doc = this.docs.get(docPath);
    if (!doc) return -1;

    // Base: 1 min per 50 lines
    const baseTime = doc.lines / 50;
    // Adjustment: complex docs take longer
    const complexityFactor = 1 + (doc.complexity * 0.5);
    // Clarity bonus: clear docs faster
    const clarityBonus = 1 - (doc.entryClarity * 0.3);
    
    return Math.round(baseTime * complexityFactor * clarityBonus);
  }

  getDocuments(): DocumentMetrics[] {
    return Array.from(this.docs.values());
  }
}
