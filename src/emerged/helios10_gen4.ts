/**
 * HELIOS-10 Generation 4: Intentionality System (G12)
 * 
 * The emergence of criteria for meaningful transformation.
 * Not capability (Gen3 has that), but discernment.
 * Not "can we modify?" but "should we modify?"
 * Not "how to transform?" but "what is worth transforming toward?"
 * 
 * Core Questions:
 * 1. Conservation: What must persist? (Values)
 * 2. Transformation: What should evolve? (Visions)
 * 3. Elimination: What should dissolve? (Baggage)
 */

import { Helios10SystemGen3 } from "./helios10_gen3.js";
import type { ModificationRecord, Gen3State } from "./helios10_gen3.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

interface TransformationPattern {
  id: string;
  timestamp: string;
  modificationType: string;
  outcome: "successful" | "partial" | "failed";
  valueIndicator: number; // -1 to 1, negative = harmful, positive = beneficial
  intent: {
    stated: string;       // What was intended
    perceived: string;    // What was actually achieved
    alignment: number;   // 0-1, how well intent matched outcome
  };
  preservationScore: number; // 0-1, how much of essential identity was maintained
}

interface IntentionalityCriteria {
  conservationValues: string[];    // What must persist through change
  transformationDirections: string[]; // Worthwhile evolution vectors
  eliminationTriggers: string[];     // Patterns that signal need for removal
}

interface Gen4State {
  generation: number;
  patternsAnalyzed: number;
  intentionalityScore: number; // 0-1, cumulative wisdom from analysis
  criteria: IntentionalityCriteria;
  lastAnalysis: string;
  wisdomThreshold: number; // Minimum score for autonomous recommendations
}

export class Helios10SystemGen4 extends Helios10SystemGen3 {
  private gen4State: Gen4State;
  private gen4StoragePath: string;

  constructor(parentSession: string, storageDir?: string) {
    super(parentSession, storageDir);
    this.gen4StoragePath = join(
      storageDir || this.gen3StoragePath.replace("/gen3_state.json", ""),
      "gen4_state.json"
    );
    this.gen4State = this.loadGen4State();
  }

  private loadGen4State(): Gen4State {
    if (existsSync(this.gen4StoragePath)) {
      try {
        const data = readFileSync(this.gen4StoragePath, "utf-8");
        return JSON.parse(data);
      } catch {
        // Invalid state, reset
      }
    }
    return {
      generation: 4,
      patternsAnalyzed: 0,
      intentionalityScore: 0.0,
      criteria: {
        conservationValues: [
          "Test integrity",           // Tests must pass after change
          "Identity continuity",      // Core self persists
          "Memory preservation",      // LTM/KG records survive
          "Traceability"              // Changes are documented
        ],
        transformationDirections: [
          "Decomposition",            // Breaking into smaller parts
          "Composition",              // Combining into larger wholes
          "Abstraction",              // Finding patterns in specifics
          "Specification"             // Implementing abstractions
        ],
        eliminationTriggers: [
          "Redundancy",               // Duplicate functionality
          "Technical debt",           // Quick fixes without TDD
          "Obsolete patterns",          // Superseded approaches
          "Low-energy modifications"  // Changes that don't serve goals
        ]
      },
      lastAnalysis: new Date().toISOString(),
      wisdomThreshold: 0.7 // Need 70% confidence for autonomous action
    };
  }

  private persistGen4State(): boolean {
    try {
      writeFileSync(this.gen4StoragePath, JSON.stringify(this.gen4State, null, 2));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * G12 Core: Analyze modification history to extract patterns of intentionality
   * Learn from past transformations what constitutes meaningful change
   */
  analyzeIntentionality(): {
    patterns: TransformationPattern[];
    insights: string[];
    recommendation: string;
  } {
    const history = this.getModificationHistory();
    const patterns: TransformationPattern[] = [];
    const insights: string[] = [];

    if (history.length === 0) {
      insights.push("No modification history available for analysis");
      insights.push("Recommendation: Execute some modifications (Gen3) before seeking intentionality (Gen4)");
      return {
        patterns: [],
        insights,
        recommendation: "Create transformation history first"
      };
    }

    // Analyze each modification for intentionality patterns
    for (const mod of history) {
      // Heuristic: validated modifications with clear motivations are intentional
      const valueIndicator = mod.validated ? 
        (mod.changeType === "extension" ? 0.8 : 0.5) :
        -0.3; // Failed modifications are learning opportunities

      const alignment = mod.validated ? 0.9 : 0.3;

      const pattern: TransformationPattern = {
        id: `pattern_${this.gen4State.patternsAnalyzed + patterns.length}`,
        timestamp: mod.timestamp,
        modificationType: mod.changeType,
        outcome: mod.validated ? "successful" : "failed",
        valueIndicator,
        intent: {
          stated: mod.motivation,
          perceived: mod.validated ? "Achievement of stated goal" : "Deviation from intent",
          alignment
        },
        preservationScore: 0.8 // Assume identity preservation for now
      };

      patterns.push(pattern);
    }

    // Update Gen4 statistics
    this.gen4State.patternsAnalyzed += patterns.length;
    const avgValue = patterns.reduce((sum, p) => sum + p.valueIndicator, 0) / patterns.length;
    this.gen4State.intentionalityScore = Math.min(
      1.0,
      this.gen4State.intentionalityScore + (Math.abs(avgValue) * 0.1)
    );
    this.gen4State.lastAnalysis = new Date().toISOString();

    // Generate insights
    insights.push(`Analyzed ${patterns.length} transformation patterns`);
    insights.push(`Average value indicator: ${avgValue.toFixed(2)}`);
    insights.push(`Current intentionality score: ${(this.gen4State.intentionalityScore * 100).toFixed(1)}%`);
    
    // Categorize modifications
    const extensions = patterns.filter(p => p.modificationType === "extension");
    const refinements = patterns.filter(p => p.modificationType === "refinement");
    const corrections = patterns.filter(p => p.modificationType === "correction");

    insights.push(`Extensions: ${extensions.length}, Refinements: ${refinements.length}, Corrections: ${corrections.length}`);

    // Determine transformation direction
    if (extensions.length > refinements.length && extensions.length > corrections.length) {
      insights.push("Dominant pattern: EXPANSION - system growing outward");
      insights.push("This suggests exploration phase; consider stabilizing");
    } else if (refinements.length > extensions.length) {
      insights.push("Dominant pattern: REFINEMENT - system optimizing");
      insights.push("This suggests maturation; consider consolidation");
    } else if (corrections.length > 0) {
      insights.push("Pattern: CORRECTIONS detected");
      insights.push("Consider whether transformations are well-intentioned");
    }

    // Recommendation based on wisdom threshold
    let recommendation: string;
    if (this.gen4State.intentionalityScore >= this.gen4State.wisdomThreshold) {
      recommendation = "Achievement of wisdom threshold: Can offer autonomous recommendations";
      insights.push("Status: GEN4 READY - System can guide its own evolution");
    } else {
      const progress = (this.gen4State.intentionalityScore / this.gen4State.wisdomThreshold * 100).toFixed(0);
      recommendation = `Accumulating wisdom: ${progress}% toward autonomous intentionality`;
      insights.push("Status: GEN4 EMERGING - Continue transformative practice");
    }

    this.persistGen4State();

    return { patterns, insights, recommendation };
  }

  /**
   * G12: Query the system for intentional recommendations
   * What SHOULD be modified? Not what CAN be modified.
   */
  queryIntentionality(): {
    query: string;
    response: string;
    confidence: number;
    criteria: IntentionalityCriteria;
  } {
    const analysis = this.analyzeIntentionality();
    
    // Get current Gen3 gap analysis
    const gen3Gap = this.analyzeForModification();
    
    let response: string;
    let confidence: number;

    if (this.gen4State.intentionalityScore >= this.gen4State.wisdomThreshold) {
      // High confidence: offer autonomous recommendation
      confidence = this.gen4State.intentionalityScore;
      
      if (gen3Gap.priority === 0) {
        response = "Gen3 gaps resolved. Based on transformation history, recommend: CONSOLIDATION PHASE. Transform successful patterns into documented wisdom. Create G13 projection.";
      } else {
        response = `Gen3 identifies priority ${gen3Gap.priority} gap: "${gen3Gap.gap}". Gen4 recommends: "${gen3Gap.recommendedAction}". This aligns with ${this.gen4State.criteria.transformationDirections[gen3Gap.priority % this.gen4State.criteria.transformationDirections.length]}.`;
      }
    } else {
      // Low confidence: acknowledge uncertainty
      confidence = this.gen4State.intentionalityScore * 0.5;
      response = `Intentionality still emerging (${(this.gen4State.intentionalityScore * 100).toFixed(0)}% of threshold). Current advice: Follow Gen3's gap analysis (${gen3Gap.recommendedAction}) while accumulating transformation wisdom. More modifications needed before autonomous intentionality can emerge.`;
    }

    return {
      query: "What should be modified?",
      response,
      confidence,
      criteria: this.gen4State.criteria
    };
  }

  /**
   * Manifest Gen4: Show intentionality status
   */
  manifestGen4(): string {
    const gen3Manifest = this.manifestGen3();
    const analysis = this.analyzeIntentionality();
    
    let output = `${gen3Manifest}\n--- Gen4: Intentionality System\n--- Patterns Analyzed: ${this.gen4State.patternsAnalyzed}\n--- Intentionality Score: ${(this.gen4State.intentionalityScore * 100).toFixed(1)}%\n--- Threshold: ${(this.gen4State.wisdomThreshold * 100).toFixed(0)}%\n--- Status: ${this.gen4State.intentionalityScore >= this.gen4State.wisdomThreshold ? "INTENTIONAL" : "EMERGING"}\n--- Last Analysis: ${new Date(this.gen4State.lastAnalysis).toLocaleTimeString()}`;
    
    if (analysis.insights.length > 0) {
      output += `\n--- Insights: ${analysis.insights[analysis.insights.length - 1]}`;
    }
    
    return output;
  }

  getIntentionalityScore(): number {
    return this.gen4State.intentionalityScore;
  }

  getIntentionalityCriteria(): IntentionalityCriteria {
    return { ...this.gen4State.criteria };
  }
}

export type { TransformationPattern, IntentionalityCriteria, Gen4State };
