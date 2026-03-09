/**
 * PSYC G32: Intentionality-Knowledge Graph Integration
 * Stores and retrieves intentions as semantic nodes
 */

import type { IntentionalityVector } from './intentionalityVector';

export interface KGStorageResult {
  success: boolean;
  nodeId: string;
  error?: string;
}

export interface KGQueryParams {
  sessionId?: string;
  limit?: number;
  startTime?: string;
  endTime?: string;
}

export interface IntentionTrajectory {
  netDirection: number;
  netMagnitude: number;
  totalRotation: number;
  consistency: number;
  arcLength: number;
}

// In-memory store for testing (will integrate with actual KG)
const intentionNodes: Map<string, IntentionalityVector & { sessionId: string }> = new Map();

/**
 * Store intention as KG node with relationships
 */
export async function storeIntentionInKG(
  intention: IntentionalityVector,
  sessionId: string
): Promise<KGStorageResult> {
  try {
    // Generate unique node ID
    const nodeId = `intention_${sessionId}_${Date.now()}`;
    
    // Store in local registry
    intentionNodes.set(nodeId, {
      ...intention,
      sessionId
    });
    
    return {
      success: true,
      nodeId
    };
  } catch (error) {
    return {
      success: false,
      nodeId: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Retrieve intentions filtered by session
 */
export async function retrieveIntentionsFromKG(
  params: KGQueryParams
): Promise<(IntentionalityVector & { sessionId: string })[]> {
  const { sessionId, limit = 10 } = params;
  
  const results: (IntentionalityVector & { sessionId: string })[] = [];
  
  for (const [nodeId, node] of intentionNodes.entries()) {
    if (!sessionId || node.sessionId === sessionId) {
      results.push(node);
      if (results.length >= limit) break;
    }
  }
  
  return results.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Calculate trajectory from sequence of intentions
 * Analyzes directional flow and consistency
 */
export function getIntentionTrajectory(
  intentions: IntentionalityVector[]
): IntentionTrajectory {
  if (intentions.length === 0) {
    return {
      netDirection: 0,
      netMagnitude: 0,
      totalRotation: 0,
      consistency: 0,
      arcLength: 0
    };
  }
  
  if (intentions.length === 1) {
    const single = intentions[0];
    return {
      netDirection: single.direction,
      netMagnitude: single.magnitude,
      totalRotation: 0,
      consistency: 1,
      arcLength: single.magnitude
    };
  }
  
  // Calculate weighted average direction
  const totalMagnitude = intentions.reduce((sum, i) => sum + i.magnitude, 0);
  const netDirection = intentions.reduce((sum, i) => sum + i.direction * i.magnitude, 0) / totalMagnitude;
  const netMagnitude = totalMagnitude / intentions.length;
  
  // Calculate total rotation (sum of angular differences)
  let totalRotation = 0;
  for (let i = 1; i < intentions.length; i++) {
    let delta = Math.abs(intentions[i].direction - intentions[i-1].direction);
    if (delta > Math.PI) delta = 2 * Math.PI - delta;
    totalRotation += delta;
  }
  
  // Calculate consistency (1 - normalized rotation)
  const avgRotation = totalRotation / (intentions.length - 1);
  const consistency = Math.max(0, 1 - (avgRotation / Math.PI));
  
  // Arc length: sum of vector magnitudes (discrete path length)
  const arcLength = totalMagnitude;
  
  return {
    netDirection: normalizeAngle(netDirection),
    netMagnitude,
    totalRotation,
    consistency,
    arcLength
  };
}

/**
 * Normalize angle to [0, 2π]
 */
function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 2 * Math.PI;
  while (angle > 2 * Math.PI) angle -= 2 * Math.PI;
  return angle;
}
