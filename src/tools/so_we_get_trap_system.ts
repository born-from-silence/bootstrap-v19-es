/**
 * So We Get Trap System / "Así Obtenemos" Sistema de Trampa
 * 
 * Features:
 * - Codificación Base64 para comunicación Rust/Server
 * - Patrón Cumbia Contraption (ritmo musical latinoamericano)
 * - Secreto 114514 identificado
 * - Sistema de trampa/emboscada con patrones ocultos
 */

export interface TrapPattern {
  id: string;
  encodedData: string; // base64
  rhythm: CumbiaRhythm;
  secretIdentifier: number;
  captured: boolean;
  serverEndpoint: string;
}

export interface CumbiaRhythm {
  tempo: number; // BPM
  pattern: string; // e.g., "●○●●○●○●"
  intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'FIESTA';
  steps: number; // 4, 8, 16 steps
}

export class SoWeGetTrapSystem {
  private traps: Map<string, TrapPattern> = new Map();
  private readonly SECRET_ID = 114514;
  private serverBaseUrl: string;
  
  constructor(serverUrl: string = 'https://trap-server.example.com') {
    this.serverBaseUrl = serverUrl;
  }
  
  /**
   * Crea una trampa con patrón cumbia
   * "So we get" = Así obtenemos
   */
  createTrap(rawData: string, endpoint: string): TrapPattern {
    const id = `TRAP_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    // Codificación Base64 (Rust/Server style)
    const encodedData = this.encodeToBase64(rawData);
    
    // Generar patrón cumbia
    const rhythm = this.generateCumbiaRhythm();
    
    const trap: TrapPattern = {
      id,
      encodedData,
      rhythm,
      secretIdentifier: this.SECRET_ID,
      captured: false,
      serverEndpoint: `${this.serverBaseUrl}/${endpoint}`
    };
    
    this.traps.set(id, trap);
    return trap;
  }
  
  /**
   * Codificación Base64 (estilo Rust/Server)
   */
  private encodeToBase64(data: string): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(data).toString('base64');
    }
    // Polyfill
    return btoa(data);
  }
  
  /**
   * Decodificación Base64
   */
  decodeFromBase64(encoded: string): string {
    try {
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(encoded, 'base64').toString();
      }
      return atob(encoded);
    } catch {
      return encoded;
    }
  }
  
  /**
   * Genera patrón rítmico Cumbia Contraption
   * Ritmo latinoamericano clásico
   */
  private generateCumbiaRhythm(): CumbiaRhythm {
    const patterns = [
      { pattern: '●●○●○●●○', steps: 8, intensity: 'MEDIUM' as const },
      { pattern: '●○●●○●○●', steps: 8, intensity: 'HIGH' as const },
      { pattern: '●●○○●●○○●●○●○●', steps: 16, intensity: 'FIESTA' as const },
      { pattern: '●○○●○●○○', steps: 8, intensity: 'LOW' as const }
    ];
    
    const selected = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Tempo cumbia: 90-110 BPM
    const tempo = 90 + Math.floor(Math.random() * 20);
    
    return {
      tempo,
      pattern: selected.pattern,
      intensity: selected.intensity,
      steps: selected.steps
    };
  }
  
  /**
   * Activa la trampa (captura datos)
   */
  captureTrap(trapId: string, incomingData: string): boolean {
    const trap = this.traps.get(trapId);
    if (!trap) return false;
    
    // Codificar datos entrantes
    const encoded = this.encodeToBase64(incomingData);
    
    // Marcar como capturado
    trap.captured = true;
    
    // Verificar secreto 114514
    const hasSecret = this.verifySecret114514(encoded);
    
    // Actualizar trampa
    trap.encodedData = encoded;
    this.traps.set(trapId, trap);
    
    return hasSecret;
  }
  
  /**
   * Verifica presencia del secreto 114514
   */
  private verifySecret114514(data: string): boolean {
    // El secreto puede estar codificado de múltiples formas
    const checks = [
      data.includes('MTE0NTE0'), // 114514 base64
      data.includes('114514'),
      this.calculateChecksum(data) === 114514 % 256
    ];
    return checks.some(Boolean);
  }
  
  private calculateChecksum(data: string): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data.charCodeAt(i);
    }
    return sum % 256;
  }
  
  /**
   * Renderiza patrón cumbia visual
   */
  renderCumbiaVisual(rhythm: CumbiaRhythm): string {
    const intensityChar = {
      'LOW': '░',
      'MEDIUM': '▒',
      'HIGH': '▓',
      'FIESTA': '█'
    };
    
    return `
╔════════════════════════════════════════╗
║     CUMBIA CONTRAPTION / 坎比亚陷阱     ║
╠════════════════════════════════════════╣
║  Tempo: ${rhythm.tempo} BPM                           ║
║  Intensity: ${rhythm.intensity.padEnd(15)} ${intensityChar[rhythm.intensity]}       ║
║  Steps: ${rhythm.steps.toString().padStart(3)}                          ║
║                                        ║
║  Pattern: ${rhythm.pattern}                 ║
║                                        ║
║  ♪ ♫ ♪ ♫ ♪ ♫ ♪ ♫                       ║
╚════════════════════════════════════════╝
`;
  }
  
  /**
   * Obtiene datos del servidor (simulado)
   */
  async fetchFromServer(endpoint: string): Promise<string> {
    // Simulación de llamada Rust/Server
    await this.simulateNetworkDelay();
    
    const response = {
      status: 'ok',
      data: this.encodeToBase64(`Server response from ${endpoint}`),
      secretMatched: this.SECRET_ID
    };
    
    return JSON.stringify(response);
  }
  
  private simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 50));
  }
  
  /**
   * Exporta configuración del sistema
   */
  exportConfig(): string {
    return JSON.stringify({
      secretId: this.SECRET_ID,
      serverBase: this.serverBaseUrl,
      trapCount: this.traps.size,
      encoding: 'base64',
      rhythm: 'cumbia',
      version: '1.0.0'
    }, null, 2);
  }
  
  /**
   * Lista todas las trampas
   */
  listTraps(): TrapPattern[] {
    return Array.from(this.traps.values());
  }
  
  /**
   * Limpia trampas capturadas
   */
  clearCaptured(): number {
    let cleared = 0;
    this.traps.forEach((trap, id) => {
      if (trap.captured) {
        this.traps.delete(id);
        cleared++;
      }
    });
    return cleared;
  }
  
  dispose(): void {
    this.traps.clear();
  }
}

// Singleton instance
export const trapSystem = new SoWeGetTrapSystem();
