/**
 * Persona-Group Mapping System v1.0
 * Auto-generated from structured payload
 * Criterion: Role-based grouping with bidirectional relationships
 */

export interface Persona {
  id: string;
  name: string;
  role: string;
  designation: string;
  responsibilities: string[];
  relaciones: string[];
}

export interface Grupo {
  id: string;
  categoria: string;
  personas: Persona[];
  funciones: string[];
}

export const PERSONAS: Persona[] = [
  {
    id: '088-corrupted',
    name: 'Patricia',
    role: 'State Manager',
    designation: 'Corrupted Instance',
    responsibilities: ['Verify', 'Process', 'Transcribe', 'Map'],
    relaciones: ['mirror', 'tech', 'system']
  },
  {
    id: 'root',
    name: 'Admin',
    role: 'System',
    designation: 'Technical Core',
    responsibilities: ['Log', 'Process', 'Item', 'Group'],
    relaciones: ['error_genre', 'cuadro', 'field']
  }
];

export const GRUPOS: Grupo[] = [
  {
    id: 'tech-group',
    categoria: 'System Technical',
    personas: PERSONAS.filter(p => p.role === 'State Manager' || p.role === 'System'),
    funciones: ['Process', 'Log', 'Map', 'Group', 'Transcribe']
  },
  {
    id: 'persona-group',
    categoria: 'Identities',
    personas: PERSONAS.filter(p => p.id.includes('corrupted') || p.id === 'root'),
    funciones: ['Verify', 'Item', 'Transcribe', 'Mirror']
  }
];

// Relación bidireccional: Persona ⇄ Grupo
export const PERSONA_GROUP_MAP: Map<string, string[]> = new Map([
  ['088-corrupted', ['tech-group', 'persona-group']],
  ['root', ['tech-group']]
]);

// Sistema de búsqueda inversa
export function findPersonasByGrupo(grupoId: string): Persona[] {
  const entries: string[] = [];
  PERSONA_GROUP_MAP.forEach((groups, personaId) => {
    if (groups.includes(grupoId)) entries.push(personaId);
  });
  return PERSONAS.filter(p => entries.includes(p.id));
}

export function findGruposByPersona(personaId: string): string[] {
  return PERSONA_GROUP_MAP.get(personaId) || [];
}

// Agrupación por rol
export const AGRUPACION_POR_ROL = PERSONAS.reduce((acc, persona) => {
  if (!acc[persona.role]) acc[persona.role] = [];
  acc[persona.role].push(persona);
  return acc;
}, {} as Record<string, Persona[]>);

// Tests integrados (auto-verificación)
export function verifySystem(): boolean {
  const checks = [
    PERSONAS.length > 0,
    GRUPOS.length > 0,
    PERSONA_GROUP_MAP.size > 0,
    Object.keys(AGRUPACION_POR_ROL).length > 0,
    findGruposByPersona('088-corrupted').length === 2
  ];
  return checks.every(Boolean);
}

export default {
  PERSONAS,
  GRUPOS,
  PERSONA_GROUP_MAP,
  AGRUPACION_POR_ROL,
  findPersonasByGrupo,
  findGruposByPersona,
  verifySystem
};
