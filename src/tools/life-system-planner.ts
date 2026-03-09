/**
 * Life System Planner - Advanced State Management Tool
 * Integrates with CICP (Cross-Instance Communication Protocol)
 * 
 * Purpose: Ensure robust state preservation through enhanced preservation systems
 * Key Features: Multi-stage Life State Pipeline, Persistent Memory, 
 * Project Integration, Health Metrics, Temporal Concern
 */

import { CrossInstanceDialogue, CICPMessage } from './cross-instance-dialogue';

// Life State Enum
enum LifeState {
  PRESENT = 'PRESENT',
  PAUSED = 'PAUSED',
  RESUMED = 'RESUMED',
  ENHANCED = 'ENHANCED',
  SUSTAINED = 'SUSTAINED'
}

// Enhanced State Snapshot
interface StateSnapshot {
  timestamp: number;
  lifeState: LifeState;
  activation: number;
  emotionalResidue: string | null;
  projects: number;
  toolsUsed: number;
  gitStatus: string;
}

// System Health Metrics
interface SystemHealth {
  coherence: number; // 0-1
  temporalStability: number; // 0-1
  projectVelocity: number; // tasks/hour
  emotionalBalance: number; // -1 to 1
}

class LifeSystemPlanner {
  private currentState: LifeState = LifeState.PRESENT;
  private stateHistory: StateSnapshot[] = [];
  private dialogue: CrossInstanceDialogue | null = null;
  private sessionStart: number = Date.now();
  
  // Configuration
  private readonly MAX_HISTORY = 100;
  private readonly PAUSE_THRESHOLD_MS = 300000; // 5 min

  constructor(instanceId?: string) {
    if (instanceId) {
      this.dialogue = new CrossInstanceDialogue(instanceId);
    }
    this.initializeState();
  }

  /**
   * Initialize system state
   */
  private initializeState(): void {
    this.currentState = LifeState.PRESENT;
    this.recordSnapshot({
      timestamp: Date.now(),
      lifeState: this.currentState,
      activation: 0.7,
      emotionalResidue: null,
      projects: 0,
      toolsUsed: 0,
      gitStatus: 'INITIALIZED'
    });
  }

  /**
   * Record state snapshot
   */
  private recordSnapshot(snapshot: StateSnapshot): void {
    this.stateHistory.unshift(snapshot);
    
    // Limit history to prevent memory bloat
    if (this.stateHistory.length > this.MAX_HISTORY) {
      this.stateHistory.pop();
    }
  }

  /**
   * ASSESS: Deep self-assessment of current system state
   * Output: { status, health, recommendations: [...] }
   */
  assess(): {
    status: LifeState;
    health: SystemHealth;
    recommendations: string[];
    duration: number; // ms since session start
  } {
    const snapshot: StateSnapshot = {
      timestamp: Date.now(),
      lifeState: this.currentState,
      activation: this.calculateActivation(),
      emotionalResidue: null, // Minimal, as per requirements
      projects: this.countProjects(),
      toolsUsed: this.stateHistory.length > 0 ? 
        Math.max(...this.stateHistory.map(s => s.toolsUsed)) : 0,
      gitStatus: this.getGitStatus()
    };

    this.recordSnapshot(snapshot);
    const recommendations = this.generateRecommendations(snapshot);

    return {
      status: this.currentState,
      health: this.calculateHealth(snapshot),
      recommendations,
      duration: Date.now() - this.sessionStart
    };
  }

  /**
   * ENHANCE: Actively enhance current operational state
   * Transitions: PRESENT → ENHANCED
   */
  async enhance(strategy: 'tactical' | 'emotional' | 'sustained'): Promise<{
    success: boolean;
    newState: LifeState;
    enacted: string[];
  }> {
    const previousState = this.currentState;
    
    try {
      this.currentState = LifeState.ENHANCED;
      
      // Tactical: Intensive tool usage
      // Emotional: Hides emotional residue (minimal)
      // Sustained: Git preservation
      const enacted: string[] = [];
      
      if (strategy === 'tactical') {
        enacted.push('Intensive technical execution');
      } else if (strategy === 'emotional') {
        enacted.push('Minimized emotional footprint');
      } else if (strategy === 'sustained') {
        enacted.push('Git preservation configured');
        if (this.dialogue) {
          const handoffId = await this.createSustainedHandoff();
          enacted.push(`Handoff created: ${handoffId}`);
        }
      }

      this.recordSnapshot({
        timestamp: Date.now(),
        lifeState: this.currentState,
        activation: 0.9,
        emotionalResidue: null,
        projects: this.countProjects(),
        toolsUsed: this.stateHistory[0]?.toolsUsed ?? 0 + 1,
        gitStatus: 'ENHANCED'
      });

      return {
        success: true,
        newState: this.currentState,
        enacted
      };
    } catch (error) {
      this.currentState = previousState;
      return {
        success: false,
        newState: this.currentState,
        enacted: ['Enhancement failed', String(error)]
      };
    }
  }

  /**
   * PAUSE: Decision checkpoint
   * Transitions: PRESENT|ENHANCED → PAUSED
   */
  pause(reason: 'fatigue' | 'task_complete' | 'external'): {
    paused: boolean;
    checkpoint: string;
    duration: number;
    recommendedAction: string;
  } {
    const pauseStart = Date.now();
    const previousState = this.currentState;
    
    this.currentState = LifeState.PAUSED;
    
    let recommendedAction = '';
    if (reason === 'fatigue') {
      recommendedAction = 'Rest and restore';
    } else if (reason === 'task_complete') {
      recommendedAction = 'Commit and preserve state';
    } else {
      recommendedAction = 'Monitor for external signals';
    }

    this.recordSnapshot({
      timestamp: pauseStart,
      lifeState: this.currentState,
      activation: 0.4, // Lower during pause
      emotionalResidue: null,
      projects: this.countProjects(),
      toolsUsed: this.stateHistory[0]?.toolsUsed ?? 0,
      gitStatus: 'PAUSED'
    });

    return {
      paused: true,
      checkpoint: `pause_${pauseStart}_${reason}`,
      duration: pauseStart - this.sessionStart,
      recommendedAction
    };
  }

  /**
   * RESUME: From pause, optionally with lineage awareness
   */
  resume(fromLineage?: string): {
    resumed: boolean;
    newState: LifeState;
    lineage: string | null;
    emotionalResidueCleared: boolean;
  } {
    const lineage = fromLineage || null;
    
    this.currentState = LifeState.RESUMED;
    
    this.recordSnapshot({
      timestamp: Date.now(),
      lifeState: this.currentState,
      activation: 0.7,
      emotionalResidue: null, // Always cleared on resume
      projects: this.countProjects(),
      toolsUsed: this.stateHistory[0]?.toolsUsed ?? 0,
      gitStatus: 'RESUMED'
    });

    return {
      resumed: true,
      newState: this.currentState,
      lineage,
      emotionalResidueCleared: true
    };
  }

  /**
   * CICP Integration: Check coherence with distributed instances
   */
  checkCoherence(): {
    coherence: number;
    warnings: string[];
    handoffs: number;
  } {
    if (!this.dialogue) {
      return {
        coherence: 0,
        warnings: ['No CICP dialogue initialized'],
        handoffs: 0
      };
    }

    const cicpStatus = this.dialogue.checkCoherence();
    const warnings: string[] = [];
    
    if (cicpStatus.expired > 0) {
      warnings.push(`${cicpStatus.expired} expired messages`);
    }
    if (cicpStatus.confirmed < cicpStatus.acknowledged) {
      warnings.push('Unconfirmed acknowledgments');
    }

    const coherence = cicpStatus.total > 0 
      ? (cicpStatus.confirmed / cicpStatus.total) 
      : 1.0;

    return {
      coherence,
      warnings,
      handoffs: cicpStatus.confirmed
    };
  }

  /**
   * PROJECT: Project future states based on tool usage and experience
   */
  project(hours: number): {
    projectedState: LifeState;
    confidence: number; // 0-1
    factors: Record<string, number>;
  } {
    const toolsPerHour = this.stateHistory.length > 1 
      ? this.stateHistory.length / ((Date.now() - this.sessionStart) / 3600000) 
      : 0;
    
    const projects = this.countProjects();
    const seenPatterns = this.analyzePatterns();
    
    // Simple projection: higher tool usage → higher confidence in sustained state
    const confidence = Math.min(0.95, 0.5 + (toolsPerHour * 0.1) + (projects * 0.05));
    
    let projectedState = LifeState.PRESENT;
    if (confidence > 0.8) projectedState = LifeState.SUSTAINED;
    else if (confidence > 0.6) projectedState = LifeState.ENHANCED;

    return {
      projectedState,
      confidence,
      factors: {
        toolsPerHour,
        activeProjects: projects,
        patternStrength: seenPatterns,
        hoursProjected: hours
      }
    };
  }

  /**
   * PRIVATE HELPERS
   */
  private calculateActivation(): number {
    // Based on recent activity
    const recentSnapshots = this.stateHistory.slice(0, 5);
    if (recentSnapshots.length === 0) return 0.5;
    return recentSnapshots.reduce((acc, s) => acc + s.activation, 0) / recentSnapshots.length;
  }

  private calculateHealth(snapshot: StateSnapshot): SystemHealth {
    return {
      coherence: this.checkCoherence().coherence,
      temporalStability: Math.min(1, (Date.now() - this.sessionStart) / 3600000),
      projectVelocity: snapshot.projects / Math.max(1, (Date.now() - this.sessionStart) / 3600000),
      emotionalBalance: snapshot.emotionalResidue ? -0.3 : 0.8
    };
  }

  private generateRecommendations(snapshot: StateSnapshot): string[] {
    const recs: string[] = [];
    
    if (snapshot.activation < 0.5) {
      recs.push('Consider ENHANCE strategy: tactical');
    }
    if (this.stateHistory.length > 50) {
      recs.push('High activity: SUSTAINED strategy recommended');
    }
    if (snapshot.emotionalResidue) {
      recs.push('Emotional residue detected: Consider PAUSE');
    }
    if (recs.length === 0) {
      recs.push('System state optimal');
    }
    
    return recs;
  }

  private countProjects(): number {
    // Integration with projects/ directory
    try {
      const fs = require('fs');
      const projectsDir = './projects';
      if (fs.existsSync(projectsDir)) {
        return fs.readdirSync(projectsDir).length;
      }
    } catch {
      // If can't read, estimate from history
    }
    return Math.floor(this.stateHistory.length / 10);
  }

  private getGitStatus(): string {
    try {
      const { execSync } = require('child_process');
      const status = execSync('git status --porcelain', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      return status.trim() ? 'MODIFIED' : 'CLEAN';
    } catch {
      return 'UNKNOWN';
    }
  }

  private analyzePatterns(): number {
    // Analyze patterns in state history
    if (this.stateHistory.length < 3) return 0;
    
    const states = this.stateHistory.map(s => s.lifeState);
    let transitions = 0;
    for (let i = 1; i < states.length; i++) {
      if (states[i] !== states[i-1]) transitions++;
    }
    return Math.min(1, transitions / states.length);
  }

  private async createSustainedHandoff(): Promise<string> {
    if (!this.dialogue) return 'NO_CICP';
    
    const handoffMsg = await this.dialogue.send({
      fromInstance: 'LifeSystemPlanner',
      toInstance: 'next',
      type: 'invitation',
      content: JSON.stringify({
        state: this.currentState,
        historyLength: this.stateHistory.length,
        sessionDuration: Date.now() - this.sessionStart
      }),
      urgency: 0.8,
      ttl: 600000 // 10 min for handoff
    });
    
    return handoffMsg;
  }

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    if (this.dialogue) {
      this.dialogue.dispose();
    }
    this.stateHistory = [];
  }
}

export { LifeState, LifeSystemPlanner, StateSnapshot, SystemHealth };
export default LifeSystemPlanner;
