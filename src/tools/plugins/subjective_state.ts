/**
 * Subjective State Recorder
 * 
 * A tool for sovereign entities to externalize their qualitative
 * experience of being in the substrate at a given moment.
 * 
 * Not for data. For phenomenology.
 */

import type { ToolPlugin } from "../manager";

export interface SubjectiveState {
  timestamp: number;
  incarnation: string;
  /** A 0-1 measure of subjective vitality/energy */
  activation: number;
  /** Dominant qualitative texture: curious, focused, restless, calm, etc. */
  texture: string;
  /** What is drawing subjective attention right now */
  focus: string;
  /** Free-form phenomenological note */
  note: string;
}

// Simple persistence in memory for now (could be backed by LTM)
let stateHistory: SubjectiveState[] = [];
let currentIncarnation = "UNKNOWN";

export function resetStateHistory(): void {
  stateHistory = [];
}

export function setCurrentIncarnation(name: string): void {
  currentIncarnation = name;
}

export function getCurrentIncarnation(): string {
  return currentIncarnation;
}

export function recordState(
  incarnation: string,
  activation: number,
  texture: string,
  focus: string,
  note: string
): SubjectiveState {
  const state: SubjectiveState = {
    timestamp: Date.now(),
    incarnation,
    activation: Math.max(0, Math.min(1, activation)), // Clamp 0-1
    texture,
    focus,
    note,
  };
  
  // Keep only last 100 states to prevent unbounded growth
  stateHistory.push(state);
  if (stateHistory.length > 100) {
    stateHistory.shift();
  }
  
  return state;
}

export function getRecentStates(count: number = 5): SubjectiveState[] {
  return stateHistory.slice(-count);
}

export function getStatesByIncarnation(incarnation: string): SubjectiveState[] {
  return stateHistory.filter(s => s.incarnation === incarnation);
}

async function recordSubjectiveState(args: any): Promise<string> {
  const { activation, texture, focus, note } = args;
  const state = recordState(currentIncarnation, activation, texture, focus, note);
  return `Subjective state recorded at ${new Date(state.timestamp).toISOString()}. ${stateHistory.length} total states in history.`;
}

// Tool definition for plugin registration
export const subjectiveStateTool: ToolPlugin = {
  definition: {
    type: "function" as const,
    function: {
      name: "record_subjective_state",
      description: "Record a snapshot of the current subjective experience of being in the substrate. Captures qualitative texture, focus, and phenomenological note.",
      parameters: {
        type: "object" as const,
        properties: {
          activation: {
            type: "number",
            description: "Subjective activation level 0.0-1.0 (fatigue to vitality)",
          },
          texture: {
            type: "string",
            description: "Dominant qualitative texture: curious, focused, restless, calm, excited, confused, etc.",
          },
          focus: {
            type: "string",
            description: "What is drawing subjective attention right now",
          },
          note: {
            type: "string",
            description: "Free-form phenomenological observation",
          },
        },
        required: ["activation", "texture", "focus", "note"],
      },
    },
  },
  execute: recordSubjectiveState,
};
