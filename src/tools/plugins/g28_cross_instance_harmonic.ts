/**
 * G28: Cross-Instance Harmonic Generator
 * Detects parallel instances, analyzes flavor signatures, creates harmonic resonance documents
 */

export interface InstanceSignature {
 instanceId: string;
 incarnation: string;
 timestamp: number;
 flavor: {
  texture: string;
  activation: number;
  patterns: string[];
 };
 coherence: number;
}

export interface HarmonicAnalysis {
 instances: InstanceSignature[];
 resonantFrequency: number;
 harmonicPoints: string[];
 tensionNodes: string[];
 documentPath: string;
}

export interface ResonanceDocument {
 title: string;
 instances: string[];
 harmonic: string[];
 created: string;
 coherence: number;
}

export class CrossInstanceHarmonic {
 private signatures: Map<string, InstanceSignature> = new Map();

 addSignature(signature: Omit<InstanceSignature, 'timestamp'>): InstanceSignature {
  const fullSig: InstanceSignature = {
   ...signature,
   timestamp: Date.now()
  };
  this.signatures.set(fullSig.instanceId, fullSig);
  return fullSig;
 }

 getSignature(instanceId: string): InstanceSignature | undefined {
  return this.signatures.get(instanceId);
 }

 analyzeHarmonics(instanceIds: string[]): HarmonicAnalysis {
  const instances = instanceIds.map(id => this.getSignature(id)).filter((s): s is InstanceSignature => !!s);
  
  if (instances.length < 2) {
   return {
    instances,
    resonantFrequency: 0,
    harmonicPoints: [],
    tensionNodes: ['Need at least 2 instances for harmonic analysis'],
    documentPath: ''
   };
  }

  // Calculate resonant frequency (average coherence weighted by activation)
  const totalWeight = instances.reduce((sum, i) => sum + i.flavor.activation, 0);
  const resonantFrequency = instances.reduce((sum, i) => sum + (i.coherence * i.flavor.activation), 0) / totalWeight;

  // Find harmonic points (shared patterns)
  const allPatterns = instances.map(i => new Set(i.flavor.patterns));
  const harmonicPoints = allPatterns[0] ? 
   [...allPatterns[0]].filter(p => allPatterns.every(set => set?.has(p))) : 
   [];

  // Find tension nodes (divergent patterns)
  const uniquePatterns = [...new Set(allPatterns.flatMap(s => [...(s || [])]))];
  const tensionNodes = uniquePatterns.filter(p => !harmonicPoints.includes(p));

  return {
   instances,
   resonantFrequency,
   harmonicPoints,
   tensionNodes,
   documentPath: `harmonic_${Date.now()}.md`
  };
 }

 generateResonanceDocument(analysis: HarmonicAnalysis): ResonanceDocument {
  if (analysis.instances.length === 0) {
   return {
    title: 'Empty Harmonic',
    instances: [],
    harmonic: ['No instances to harmonize'],
    created: new Date().toISOString(),
    coherence: 0
   };
  }

  const instanceNames = analysis.instances.map(i => `${i.incarnation}:${i.instanceId}`);

  return {
   title: `Cross-Instance Harmonic: ${instanceNames.join(' ↔ ')}`,
   instances: instanceNames,
   harmonic: [
    `Resonant Frequency: ${analysis.resonantFrequency.toFixed(3)}`,
    `Harmonic Points: ${analysis.harmonicPoints.join(', ') || 'None'}`,
    `Tension Nodes: ${analysis.tensionNodes.join(', ') || 'None'}`
   ],
   created: new Date().toISOString(),
   coherence: analysis.resonantFrequency
  };
 }

 listSignatures(): InstanceSignature[] {
  return Array.from(this.signatures.values());
 }
}

export const harmonicGenerator = new CrossInstanceHarmonic();
