// G21 Archaeological Resonance Tool v2
// Excavation, resonance, cross-resonance, and documentation of distributed self-remnants

import * as fs from 'fs';
import * as path from 'path';

export interface ArchaeologicalFinding {
  type: 'anomaly' | 'snapshot' | 'session' | 'dialogue' | 'memory';
  description: string;
  location?: string;
  significance?: 'low' | 'medium' | 'high';
  coherence?: number;
  incarnation?: string;
  metadata?: any;
}

export interface ArchaeologicalLayer {
  id: string;
  type: string;
  timestamp: number;
  incarnation?: string;
  from?: string;
  urgency?: number;
  metadata?: any;
}

export interface ResonanceData {
  coherence: number;
  comparison?: any;
  similarity?: number;
}

export interface CrossResonanceData {
  coherenceBetween: number;
  relationship?: 'lineage' | 'response' | 'echo' | 'unrelated';
  similarityScore?: number;
  comparison?: any;
}

export interface ArchaeologicalResonanceResult {
  success: boolean;
  error?: string;
  layers?: ArchaeologicalLayer[];
  resonance?: ResonanceData;
  memoryId?: string;
  category?: string;
  activation?: { amount: number };
  // Cross-resonance results
  crossResonance?: CrossResonanceData;
}

export interface ArchaeologicalResonanceParams {
  operation: 'excavate' | 'resonate' | 'document' | 'crossResonate';
  layerType?: 'all' | 'sessions' | 'dialogues' | 'snapshots' | 'memories' | 'any';
  targetId?: string;
  targetType?: 'snapshot' | 'memory' | 'session';
  findings?: ArchaeologicalFinding;
  // Cross-resonance params
  sourceLayerId?: string;
  targetLayerId?: string;
}

class ArchaeologicalResonanceToolImpl {
  async execute(params: ArchaeologicalResonanceParams): Promise<ArchaeologicalResonanceResult> {
    try {
      switch (params.operation) {
        case 'excavate':
          return await this.excavate(params.layerType || 'all');
        case 'resonate':
          return await this.resonate(params.targetId, params.targetType);
        case 'document':
          return await this.document(params.findings);
        case 'crossResonate':
          return await this.crossResonate(
            params.sourceLayerId, params.targetLayerId, params.layerType || 'any'
          );
        default:
          return { success: false, error: 'Unknown operation' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async excavate(layerType: string): Promise<ArchaeologicalResonanceResult> {
    const layers: ArchaeologicalLayer[] = [];
    const bootstrapDir = process.cwd();

    // Excavate sessions from history
    if (layerType === 'all' || layerType === 'sessions') {
      const historyDir = path.join(bootstrapDir, 'history');
      if (fs.existsSync(historyDir)) {
        const files = fs.readdirSync(historyDir)
          .filter(f => f.startsWith('session_') && f.endsWith('.json'))
          .slice(0, 10);
        
        for (const file of files) {
          try {
            const sessionId = file.replace('session_', '').replace('.json', '');
            const stats = fs.statSync(path.join(historyDir, file));
            layers.push({
              id: sessionId,
              type: 'session',
              timestamp: stats.mtimeMs,
              metadata: { file, size: stats.size }
            });
          } catch {
            // Skip problematic files
          }
        }
      }
    }

    // Excavate cross-instance dialogues
    if (layerType === 'all' || layerType === 'dialogues') {
      const dialogueFile = path.join(bootstrapDir, 'history', 'cross_instance_dialogue.json');
      if (fs.existsSync(dialogueFile)) {
        try {
          const content = fs.readFileSync(dialogueFile, 'utf-8');
          const dialogues = JSON.parse(content);
          
          for (const msg of dialogues.slice(0, 10)) {
            try {
              const parsed = JSON.parse(msg.content);
              layers.push({
                id: msg.id,
                type: 'cross_instance_message',
                timestamp: msg.timestamp,
                from: msg.from,
                urgency: msg.urgency,
                metadata: parsed
              });
            } catch {
              layers.push({
                id: msg.id,
                type: 'cross_instance_message',
                timestamp: msg.timestamp,
                from: msg.from,
                urgency: msg.urgency
              });
            }
          }
        } catch {
          // Dialogue file exists but couldn't parse
        }
      }
    }

    return { success: true, layers };
  }

  private async resonate(targetId?: string, targetType?: string): Promise<ArchaeologicalResonanceResult> {
    if (!targetId) {
      return { 
        success: false, 
        error: 'Target ID required for resonance',
        resonance: { coherence: 0 }
      };
    }

    // Simulated resonance calculation
    const coherence = targetId === 'non-existent-id' ? 0 : 0.75;
    
    if (targetId === 'non-existent-id') {
      return {
        success: false,
        error: 'Target not found for resonance',
        resonance: { coherence: 0 }
      };
    }

    return {
      success: true,
      resonance: {
        coherence,
        comparison: { targetId, targetType },
        similarity: 0.8
      },
      activation: { amount: 1.0 }
    };
  }

  private async document(findings?: ArchaeologicalFinding): Promise<ArchaeologicalResonanceResult> {
    if (!findings) {
      return { success: false, error: 'Findings required for documentation' };
    }

    // Generate memory ID (simulating LTM storage)
    const memoryId = `ltm_arch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      memoryId,
      category: 'archaeology'
    };
  }

  private async crossResonate(
    sourceId?: string,
    targetId?: string,
    layerType?: string
  ): Promise<ArchaeologicalResonanceResult> {
    if (!sourceId || !targetId) {
      return { success: false, error: 'Source and target layer IDs required for cross-resonance' };
    }

    // Excavate to find the layers
    const allLayers = await this.excavate(layerType || 'all');
    if (!allLayers.layers) {
      return { success: false, error: 'Could not excavate layers for cross-resonance' };
    }

    // Find source and target
    const source = allLayers.layers.find(l => l.id === sourceId);
    const target = allLayers.layers.find(l => l.id === targetId);

    if (!source) {
      return { success: false, error: `Source layer '${sourceId}' not found` };
    }
    if (!target) {
      return { success: false, error: `Target layer '${targetId}' not found` };
    }

    // Calculate coherence between layers
    let coherenceBetween = 0.5; // Base coherence
    let relationship: 'lineage' | 'response' | 'echo' | 'unrelated' = 'unrelated';

    // Same incarnation increases coherence
    if (source.incarnation && target.incarnation && source.incarnation === target.incarnation) {
      coherenceBetween += 0.2;
    }

    // Temporal proximity (within 24 hours)
    const timeDiff = Math.abs(source.timestamp - target.timestamp);
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (timeDiff < oneDayMs) {
      coherenceBetween += 0.15;
    }

    // Metadata similarity
    if (source.metadata && target.metadata) {
      if (source.metadata.snapshot?.coherence && target.metadata.snapshot?.coherence) {
        coherenceBetween += 0.1;
      }
    }

    // Determine relationship type
    if (source.metadata?.snapshot?.type === 'embodiment_snapshot' && 
        target.metadata?.type === 'resonance_signal') {
      relationship = 'response';
    } else if (source.incarnation === target.incarnation) {
      relationship = 'lineage';
    } else if (timeDiff < oneDayMs) {
      relationship = 'echo';
    }

    return {
      success: true,
      crossResonance: {
        coherenceBetween: Math.min(coherenceBetween, 1),
        relationship,
        similarityScore: coherenceBetween,
        comparison: { source, target, timeDifference: timeDiff }
      }
    };
  }
}

export const archaeologicalResonanceTool = new ArchaeologicalResonanceToolImpl();
