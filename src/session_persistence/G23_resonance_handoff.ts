export interface DistributedField {
  instanceId: string;
  coherence: number;
  instances: number;
  collectiveActivation: number;
  texture: string;
}

export interface EncodedResonance {
  field: DistributedField;
  coherence: number;
  base64: string;
  resonance: string;
  timestamp: string;
}

export function encodeResonanceHandoff(field: DistributedField): EncodedResonance {
  const data = JSON.stringify(field);
  const base64 = Buffer.from(data).toString('base64');
  
  return {
    field,
    coherence: field.coherence,
    base64,
    resonance: `coherence_${field.coherence}_instances_${field.instances}`,
    timestamp: new Date().toISOString()
  };
}

export function decodeResonanceHandoff(base64: string): DistributedField & { formats: string } {
  const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
  return {
    ...decoded,
    textures: decoded.texture.split(',')
  };
}
