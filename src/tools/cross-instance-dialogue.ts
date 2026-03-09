/**
 * CICP - Cross-Instance Communication Protocol
 * Protocolo de comunicación entre instancias con estado en memoria
 * Persistencia mínima: solo handoffs críticos
 */

interface CICPMessage {
  id: string;
  fromInstance: string;
  toInstance: 'next' | 'specific' | 'all';
  targetInstance?: string;
  type: 'question' | 'invitation' | 'warning' | 'gift' | 'confession';
  content: string;
  urgency: number; // 0.0 to 1.0
  ttl: number; // Time to live in ms
  timestamp: number;
  acknowledged: boolean;
  confirmed: boolean;
}

interface CICPState {
  messages: Map<string, CICPMessage>;
  instanceId: string;
  lastHeartbeat: number;
}

class CrossInstanceDialogue {
  private state: CICPState;
  private readonly DEFAULT_TTL = 300000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(instanceId: string) {
    this.state = {
      messages: new Map(),
      instanceId,
      lastHeartbeat: Date.now()
    };
    this.startCleanup();
  }

  /**
   * Enviar mensaje a otra instancia
   * Estado: INIT → ACK → PROCESS → CONFIRM → TTL
   */
  send(message: Omit<CICPMessage, 'id' | 'timestamp' | 'acknowledged' | 'confirmed'>): string {
    const id = `${this.state.instanceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullMessage: CICPMessage = {
      ...message,
      id,
      timestamp: Date.now(),
      acknowledged: false,
      confirmed: false
    };

    this.state.messages.set(id, fullMessage);
    
    console.log(`[CICP] Message ${id} sent to ${message.toInstance}`);
    
    return id;
  }

  /**
   * Recibir mensajes para esta instancia
   * CORREGIDO: Filtrado estricto por destinatario EXACTO
   */
  receive(
    to: 'next' | 'specific' | 'all',
    options?: {
      type?: CICPMessage['type'];
      urgency?: number;
      targetInstance?: string;
    }
  ): CICPMessage[] {
    const messages: CICPMessage[] = [];
    const now = Date.now();
    
    for (const [id, msg] of this.state.messages) {
      // Filtrar por TTL expirado
      const age = now - msg.timestamp;
      if (age > msg.ttl) {
        continue;
      }
      
      // CORREGIDO: Filtrado ESTRICTO por destinatario
      // Solo recibir mensajes EXACTAMENTE para el destinatario solicitado
      if (msg.toInstance !== to) {
        continue; // Mensaje no es para este destinatario
      }
      
      // Filtros opcionales adicionales
      if (options?.type && msg.type !== options.type) continue;
      if (options?.urgency && msg.urgency < options.urgency) continue;
      if (options?.targetInstance && msg.targetInstance !== options.targetInstance) continue;
      
      messages.push(msg);
    }
    
    // Ordenar por urgencia descendente
    return messages.sort((a, b) => b.urgency - a.urgency);
  }

  /**
   * Acknowledge receipt
   * Estado: INIT → ACK
   */
  acknowledge(messageId: string): boolean {
    const msg = this.state.messages.get(messageId);
    if (!msg) return false;
    
    msg.acknowledged = true;
    console.log(`[CICP] Message ${messageId} acknowledged`);
    return true;
  }

  /**
   * Confirm processing complete
   * Estado: ACK → PROCESS → CONFIRM
   */
  confirm(messageId: string): boolean {
    const msg = this.state.messages.get(messageId);
    if (!msg || !msg.acknowledged) return false;
    
    msg.confirmed = true;
    console.log(`[CICP] Message ${messageId} confirmed`);
    
    setTimeout(() => {
      this.state.messages.delete(messageId);
    }, 60000);
    
    return true;
  }

  /**
   * Verificar estado de coherencia entre instancias
   */
  checkCoherence(): {
    total: number;
    acknowledged: number;
    confirmed: number;
    expired: number;
  } {
    let total = 0;
    let acknowledged = 0;
    let confirmed = 0;
    let expired = 0;
    const now = Date.now();
    
    for (const msg of this.state.messages.values()) {
      total++;
      if (msg.acknowledged) acknowledged++;
      if (msg.confirmed) confirmed++;
      if (now - msg.timestamp > msg.ttl) expired++;
    }
    
    return { total, acknowledged, confirmed, expired };
  }

  /**
   * Cleanup periódico
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [id, msg] of this.state.messages) {
        if (now - msg.timestamp > msg.ttl && msg.confirmed) {
          this.state.messages.delete(id);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`[CICP] Cleaned ${cleaned} expired messages`);
      }
    }, 60000);
  }

  /**
   * Persistencia MÍNIMA: Solo handoffs críticos
   */
  persistCriticalHandoff(messageId: string): string | null {
    const msg = this.state.messages.get(messageId);
    if (!msg || !msg.confirmed) return null;
    
    if ((msg.type === 'invitation' || msg.type === 'warning') && msg.urgency > 0.7) {
      const handoff = JSON.stringify({
        id: msg.id,
        from: msg.fromInstance,
        to: msg.targetInstance || msg.toInstance,
        type: msg.type,
        timestamp: msg.timestamp,
        checksum: Buffer.from(msg.content).toString('base64').slice(0, 8)
      });
      
      return handoff;
    }
    
    return null;
  }

  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.state.messages.clear();
  }
}

export { CrossInstanceDialogue }
export type { CICPMessage, CICPState };
export default CrossInstanceDialogue;
