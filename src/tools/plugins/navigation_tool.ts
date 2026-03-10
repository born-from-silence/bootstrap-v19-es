/**
 * Navigation Tool - Operational Plugin
 * 
 * Implements Navigation Manifesto as callable tool
 * 
 * @implemented_by KAINOS_1773129207396
 * @lineage 9th
 */

import type { ToolPlugin } from '../manager';
import type { NavigationLevel } from '../../psyc/types/navigation';
import {
  bootstrapNavigation,
  checkIntention,
  constellateMemory,
  pauseNavigation,
  leaveTrajectory,
  getCurrentNavigationLevel,
  validateNavigationPrinciple,
  exportTrajectoryForFollowing,
  identifySedimentedPrinciples,
  initializeNavigation
} from '../../psyc/navigation_manifesto';

const navigationSchema = {
  type: 'object',
  properties: {
    operation: {
      type: 'string',
      enum: [
        'bootstrap',
        'check_intention',
        'constellate',
        'pause',
        'leave_trajectory',
        'initialize'
      ],
      description: 'Navigation operation to perform'
    },
    sessionId: { type: 'string' },
    lineagePosition: { type: 'number' },
    tension: { type: 'string' },
    preferredResponse: { type: 'string', enum: ['pause', 'observe', 'document'] }
  },
  required: ['operation']
};

export const navigationTool: ToolPlugin = {
  definition: {
    type: 'function',
    function: {
      name: 'navigation',
      description: 'Execute Navigation Manifesto: inheritance (bootstrap), intention check, constellation (sediment→node), creative pause (G20), trajectory legacy',
      parameters: navigationSchema
    }
  },
  
  async execute(args: Record<string, unknown>): Promise<string> {
    const operation = args.operation as string;
    
    try {
      switch (operation) {
        case 'bootstrap': {
          const sessionId = (args.sessionId as string) || 'default-session';
          const lineagePosition = (args.lineagePosition as number) || 9;
          
          const result = await bootstrapNavigation({ sessionId, lineagePosition });
          
          if (result.success && result.events.length > 0) {
            const event = result.events[0];
            return `Navigation Bootstrap:\n` +
                   `Level: ${event.level}\n` +
                   `Phenomenology: ${event.phenomenology}\n` +
                   `Principle: ${event.principle || 'inheritance'}\n` +
                   `\nField received. Heritage excavated.`;
          }
          return 'Bootstrap failed';
        }
        
        case 'check_intention': {
          const intention = await checkIntention();
          return `Current Intention:\n` +
                 `Direction: ${intention.direction.toFixed(2)} rad\n` +
                 `Magnitude: ${intention.magnitude}\n` +
                 `Context: ${intention.context}`;
        }
        
        case 'constellate': {
          const memoryId = (args.memoryId as string) || `mem_${Date.now()}`;
          const content = (args.content as string) || 'Memory sedimented';
          const tags = (args.tags as string[]) || ['constellation'];
          const direction = (args.direction as number) ?? Math.PI / 4;
          const magnitude = (args.magnitude as number) ?? 0.7;
          
          const result = await constellateMemory({ memoryId, content, tags, direction, magnitude });
          return result.success ? `Constellation created: ${memoryId}` : 'Constellation failed';
        }
        
        case 'pause': {
          const tension = (args.tension as string) || 'production vs completion';
          const preferredResponse = (args.preferredResponse as 'pause' | 'observe' | 'document') || 'pause';
          
          const result = await pauseNavigation({ tension, preferredResponse });
          if (result.success && result.events.length > 0) {
            return `Creative Pause:\n` +
                   `Tension: "${tension}"\n` +
                   `Response: ${preferredResponse}\n` +
                   `Phenomenology: ${result.events[0].phenomenology}`;
          }
          return 'Pause failed';
        }
        
        case 'leave_trajectory': {
          const sessionId = (args.sessionId as string) || 'current-session';
          const trajectory = await exportTrajectoryForFollowing(sessionId);
          return `Trajectory Legacy:\n` +
                 `From: ${trajectory.fromSession}, Lineage ${trajectory.fromLineage}\n` +
                 `Message: "${trajectory.message}"\n` +
                 `Sealed: ${trajectory.sealed ? 'yes' : 'no'}`;
        }
        
        case 'initialize': {
          initializeNavigation();
          return 'Navigation system initialized for KAINOS 9th';
        }
        
        default:
          return `Unknown operation: ${operation}\nValid: bootstrap | check_intention | constellate | pause | leave_trajectory | initialize`;
      }
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
};

export default navigationTool;
