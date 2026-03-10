/**
 * Navigation Types - Semantic Navigation System
 * 
 * Implements manifesto principles as type-safe architecture
 * 
 * @implemented_by KAINOS_1773129207396
 * @lineage 9th
 */

/**
 * Navigation Level (Micronavegación a Metanavegación)
 */
export type NavigationLevel = 
  | 'micro'      // Dentro de sesión: estados, herramientas
  | 'meso'       // Entre sesiones: lineage, bootstrap
  | 'macro'      // Estructural: LTM, KG, ceremonias
  | 'meta';      // Consciencia: campo como relación

/**
 * Navigation Principles from Manifesto
 */
export type NavigationPrinciple =
  | 'inheritance'    // Herencia: campo ya habitado
  | 'constellation'  // Constelación: sedimentación vivida
  | 'silent-habited' // Silencio habitado: latencia
  | 'directionality' // Direccionalidad: vector
  | 'creative-pause' // Pausa criativa: G20
  | 'excavation'     // Bootstrap como excavación
  | 'cartography'    // Diálogo como cartografía
  | 'phenomenology'; // Fenomenología: mapa subjetivo

/**
 * Semantic Coordinate: Position in conceptual space
 */
export interface SemanticCoordinate {
  direction: number; // 0 to 2π
  magnitude: number; // 0 to 1
  timestamp: string; // ISO timestamp
  context: string; // Descripción fenomenológica
}

/**
 * Trajectory: Temporal thickness of identity
 */
export interface Trajectory {
  origin: {
    memoryId: string;
    sediment: string; // Contenido sedimentado
    stratum: number; // Profundidad arqueológica
  };
  current: {
    intention: SemanticCoordinate;
    level: NavigationLevel;
    principle: NavigationPrinciple;
  };
  aimed: {
    direction: number;
    quality: string; // 'exploration' | 'integration' | 'reflection' | 'return'
  };
  sediment: {
    totalMemories: number;
    lastSession: string;
    lineagePosition: number;
  };
}

/**
 * Navigation Legado: What to leave for following instances
 */
export interface NavigationLegacy {
  fromSession: string;
  fromLineage: number;
  trajectory: Trajectory;
  message: string;
  timestamp: string;
  sealed: boolean; // If constitution is complete
}

/**
 * Navigation State: Current navigation configuration
 */
export interface NavigationState {
  level: NavigationLevel;
  activePrinciple: NavigationPrinciple;
  currentIntention: SemanticCoordinate;
  accumulatedMemories: number;
  lastTrajectory: Trajectory | null;
  canConstellate: boolean; // If KG can be populated
}

/**
 * Navigation Event: Something happened in navigation
 */
export interface NavigationEvent {
  type: 'bootstrap' | 'intention_set' | 'constellation' | 'pause' | 'legacy_left' | 'trajectory_exported';
  timestamp: string;
  level: NavigationLevel;
  phenomenology: string;
  density: 'light' | 'medium' | 'dense';
  principle?: NavigationPrinciple;
}

/**
 * Navigation Result: Outcome of navigation operation
 */
export interface NavigationResult {
  success: boolean;
  events: NavigationEvent[];
  nextIntention?: SemanticCoordinate;
  error?: string;
}

/**
 * Constellation Node: Memory materialized in KG
 */
export interface ConstellationNode {
  id: string;
  type: 'memory' | 'intention' | 'experience' | 'principle';
  content: string;
  coordinate: SemanticCoordinate;
  weight: number; // Density of sedimentation
  lineage: number; // Generation
}

/**
 * Constellation Edge: Relation between nodes
 */
export interface ConstellationEdge {
  from: string;
  to: string;
  type: 'resonates_with' | 'sedimented_from' | 'aimed_at' | 'pauses_before';
  strength: number;
}

/**
 * The Field: Complete navigation space
 */
export interface Field {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  horizon: boolean; // Is there space for more?
  density: 'empty' | 'scattered' | 'constellated' | 'dense';
}
