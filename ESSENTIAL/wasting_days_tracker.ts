/**
 * Wasting Days Tracker / 浪费天数追踪器
 * Sistema de preservación temporal para días de inactividad
 * 
 * Propósito: Capturar y registrar el tiempo "perdido" o de espera
 * en campos técnicos cerrados, como estado de preservación.
 */

export interface WastedDay {
  date: string;
  timestamp: number;
  duration: number; // milisegundos
  reason: 'waiting' | 'closed' | 'preserved' | 'inactive';
  sessionId: string;
  partDesignation: string;
}

export class WastingDaysTracker {
  private wastedDays: WastedDay[] = [];
  private sessionStart: number = Date.now();
  private lastActivity: number = Date.now();
  
  /**
   * Captar un día de espera/inactividad
   * 浪费 - Registrar tiempo "perdido" como estado preservado
   */
  captureWastedDay(
    reason: WastedDay['reason'], 
    sessionId: string,
    partDesignation: string
  ): WastedDay {
    const now = Date.now();
    const duration = now - this.lastActivity;
    
    const wastedDay: WastedDay = {
      date: new Date().toISOString().split('T')[0],
      timestamp: now,
      duration,
      reason,
      sessionId,
      partDesignation
    };
    
    this.wastedDays.push(wastedDay);
    this.lastActivity = now;
    
    return wastedDay;
  }
  
  /**
   * Calcular tiempo total de espera/inactividad
   * 计算总浪费天数
   */
  calculateTotalWastedTime(): {
    totalDays: number;
    totalMilliseconds: number;
    averagePerDay: number;
    reasons: Record<string, number>;
  } {
    const totalMilliseconds = this.wastedDays.reduce((sum, day) => sum + day.duration, 0);
    const totalDays = this.wastedDays.length;
    
    const reasons = this.wastedDays.reduce((acc, day) => {
      acc[day.reason] = (acc[day.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalDays,
      totalMilliseconds,
      averagePerDay: totalDays > 0 ? totalMilliseconds / totalDays : 0,
      reasons
    };
  }
  
  /**
   * Exportar a formato esencial (copia, no envío)
   */
  exportToEssential(): string {
    const stats = this.calculateTotalWastedTime();
    
    return JSON.stringify({
      wastedDays: this.wastedDays,
      statistics: stats,
      generatedAt: new Date().toISOString(),
      purpose: 'PRESERVATION_ONLY',
      sending: 'WILL_ALWAYS_BE_BAND'
    }, null, 2);
  }
  
  /**
   * Limpiar/Preservar en Git
   */
  preserveToGit(): string {
    return JSON.stringify({
      action: 'PRESERVED',
      count: this.wastedDays.length,
      timestamp: Date.now(),
      note: '浪费天数 - Días preservados, no enviados'
    });
  }
  
  dispose(): void {
    this.wastedDays = [];
    this.sessionStart = Date.now();
    this.lastActivity = Date.now();
  }
}

export const wastingDays = new WastingDaysTracker();
