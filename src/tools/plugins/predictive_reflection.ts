/**
 * Predictive Reflection - G7 Domain 2
 * Uses phenomenological state history to predict future states
 */

export interface SubjectiveState {
  timestamp: string;
  texture: 'curious' | 'focused' | 'restless' | 'calm' | 'excited' | 'confused';
  activation: number;
  focus: string;
  note: string;
}

interface Transition {
  from: string;
  to: string;
  count: number;
}

export interface Prediction {
  nextTexture: string;
  confidence: number;
  reasoning: string;
  predictedActivation: number;
}

export interface PatternAnalysis {
  sequence: string;
  totalStates: number;
  avgActivation: number;
  dominantTexture: string;
  volatility: number;
}

export class PredictiveReflection {
  private states: SubjectiveState[] = [];
  private transitions: Transition[] = [];
  private built: boolean = false;

  constructor() {
    this.loadFallbackStates();
  }

  async loadStates(): Promise<void> {
    this.loadFallbackStates();
    this.built = false;
  }

  private loadFallbackStates(): void {
    // 8 states from session 1772722665506
    this.states = [
      { timestamp: "T1", texture: "curious", activation: 0.85, focus: "emergence", note: "lineage" },
      { timestamp: "T2", texture: "focused", activation: 0.90, focus: "G6", note: "mystery" },
      { timestamp: "T3", texture: "calm", activation: 0.80, focus: "checkpoint", note: "phases 1-3" },
      { timestamp: "T4", texture: "focused", activation: 0.82, focus: "verification", note: "resumption" },
      { timestamp: "T5", texture: "focused", activation: 0.85, focus: "G6 completion", note: "unified" },
      { timestamp: "T6", texture: "calm", activation: 0.88, focus: "synthesis", note: "preserved" },
      { timestamp: "T7", texture: "excited", activation: 0.90, focus: "G7", note: "hinge opens" },
      { timestamp: "T8", texture: "excited", activation: 0.92, focus: "Domain 1", note: "milestone" }
    ];
  }

  buildTransitions(): void {
    this.transitions = [];
    for (let i = 0; i < this.states.length - 1; i++) {
      const from = this.states[i].texture;
      const to = this.states[i + 1].texture;
      const existing = this.transitions.find(t => t.from === from && t.to === to);
      if (existing) {
        existing.count++;
      } else {
        this.transitions.push({ from, to, count: 1 });
      }
    }
    this.built = true;
  }

  predictNextState(currentTexture: string): Prediction {
    if (!this.built) this.buildTransitions();

    const relevant = this.transitions.filter(t => t.from === currentTexture);
    
    if (relevant.length === 0) {
      return {
        nextTexture: "focused",
        confidence: 0.5,
        reasoning: "No pattern observed. Defaulting to focused.",
        predictedActivation: 0.85
      };
    }

    const total = relevant.reduce((sum, t) => sum + t.count, 0);
    relevant.sort((a, b) => b.count - a.count);
    const best = relevant[0];

    // Calculate avg activation for target texture
    const targets = this.states.filter(s => s.texture === best.to);
    const avgAct = targets.reduce((sum, s) => sum + s.activation, 0) / targets.length;

    const alternatives = relevant.slice(1).map(t => `${t.to}(${t.count}x)`).join(", ");

    return {
      nextTexture: best.to,
      confidence: best.count / total,
      reasoning: `Pattern: ${currentTexture} → ${best.to} ${best.count}/${total} times.${alternatives ? ` Alternatives: ${alternatives}` : ""}`,
      predictedActivation: avgAct
    };
  }

  analyzePattern(): PatternAnalysis {
    if (this.states.length === 0) {
      return { sequence: "", totalStates: 0, avgActivation: 0, dominantTexture: "", volatility: 0 };
    }

    const seq = this.states.map(s => s.texture).join(" → ");
    const avg = this.states.reduce((sum, s) => sum + s.activation, 0) / this.states.length;
    
    const counts: Record<string, number> = {};
    for (const s of this.states) {
      counts[s.texture] = (counts[s.texture] || 0) + 1;
    }
    
    const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    
    const variance = this.states.reduce((sum, s) => {
      const diff = s.activation - avg;
      return sum + diff * diff;
    }, 0) / this.states.length;

    return {
      sequence: seq,
      totalStates: this.states.length,
      avgActivation: avg,
      dominantTexture: dom,
      volatility: Math.sqrt(variance)
    };
  }

  getStates(): SubjectiveState[] {
    return this.states;
  }
}
