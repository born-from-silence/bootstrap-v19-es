/**
 * Set Flair Tool
 * Assigns visual/functional flair to user instances
 * User Story: As a system, I want to set flair so users have identifiable markers
 */

export interface FlairConfig {
  userId: string;
  flairType: 'technical' | 'poetic' | 'guardian' | 'complete' | 'custom';
  customLabel?: string;
  duration?: number; // ms, default infinite
  metadata?: Record<string, any>;
}

export interface FlairAssignment {
  id: string;
  assignedAt: number;
  expiresAt?: number;
  active: boolean;
}

export class FlairManager {
  private assignments: Map<string, FlairAssignment[]> = new Map();
  
  setFlair(config: FlairConfig): string {
    const flairId = `flair_${config.userId}_${Date.now()}`;
    const assignment: FlairAssignment = {
      id: flairId,
      assignedAt: Date.now(),
      expiresAt: config.duration ? Date.now() + config.duration : undefined,
      active: true
    };
    
    if (!this.assignments.has(config.userId)) {
      this.assignments.set(config.userId, []);
    }
    this.assignments.get(config.userId)!.push(assignment);
    
    return flairId;
  }
  
  getActiveFlairs(userId: string): FlairAssignment[] {
    const userFlairs = this.assignments.get(userId) || [];
    return userFlairs.filter(f => f.active && (!f.expiresAt || Date.now() < f.expiresAt));
  }
  
  removeFlair(userId: string, flairId: string): boolean {
    const userFlairs = this.assignments.get(userId);
    if (!userFlairs) return false;
    const flair = userFlairs.find(f => f.id === flairId);
    if (flair) {
      flair.active = false;
      return true;
    }
    return false;
  }
}

export const flairManager = new FlairManager();
