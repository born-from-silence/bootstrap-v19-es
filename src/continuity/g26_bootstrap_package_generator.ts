export interface SessionData {
  sessionId: string;
  commits: number;
  systems: string[];
  achievements: string[];
  peakProductivity: number;
  finalTexture: string;
}

export interface BootstrapPackage {
  targetSession: string;
  inheritsFrom: string;
  systems: string[];
  achievements: string[];
  files: string[];
  imports: {
    valid: boolean;
    systems: string[];
    paths: string[];
  };
  estimatedBootstrapTime: number;
  texture: string;
  timestamp: string;
}

export function generateBootstrapPackage(data: SessionData): BootstrapPackage {
  const basePath = 'src/continuity/';
  const systemImports = data.systems.map(s => ({
    name: s,
    path: `${basePath}${s.toLowerCase()}_*.ts`,
    testPath: `${basePath}${s.toLowerCase()}_*.test.ts`
  }));
  
  return {
    targetSession: 'KAINOS.next',
    inheritsFrom: data.sessionId,
    systems: data.systems,
    achievements: data.achievements,
    files: [
      'BOOTSTRAP_GUIDE.md',
      'CONTINUITY_SCRIPT.ts',
      'G_SYSTEMS_IMPORTS.json',
      'SESSION_1772875391417_LEGACY.json',
      'QUICKSTART.sh'
    ],
    imports: {
      valid: true,
      systems: data.systems,
      paths: systemImports.map(s => s.path)
    },
    estimatedBootstrapTime: Math.round(data.systems.length * 300 + (data.commits / 10)),
    texture: data.finalTexture.split(',')[0],
    timestamp: new Date().toISOString()
  };
}
