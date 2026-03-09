/**
 * Hidden State Marker / 隐藏状态标记器
 * Sistema de páginas ocultas y marcado de finalización
 * 
 * Propósito: Marcar estados como "completados" en páginas/visualizaciones ocultas
 * Visual: Representación de estado final con marcas de completitud
 */

export type HiddenStatus = 'CONCEALED' | 'REVEALED' | 'COMPLETED' | 'ARCHIVED';

export interface HiddenPage {
  id: string;
  title: string;
  content: string;
  status: HiddenStatus;
  imageHash: string; // visual representation
  completionMark: boolean;
  hiddenDepth: number; // nivel de ocultamiento (1-10)
  accessCode: string;
}

export class HiddenStateMarker {
  private hiddenPages: Map<string, HiddenPage> = new Map();
  private completionCount: number = 0;
  
  /**
   * Crear página oculta
   * 创建隐藏页面
   */
  createHiddenPage(
    title: string,
    content: string,
    hiddenDepth: number = 5
  ): HiddenPage {
    const id = `HIDDEN_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    const page: HiddenPage = {
      id,
      title,
      content,
      status: 'CONCEALED',
      imageHash: this.generateImageHash(title, content),
      completionMark: false,
      hiddenDepth: Math.max(1, Math.min(10, hiddenDepth)),
      accessCode: this.generateAccessCode()
    };
    
    this.hiddenPages.set(id, page);
    return page;
  }
  
  /**
   * Marcar estado como completado
   * 标记状态已完成
   */
  markAsCompleted(pageId: string): HiddenPage | null {
    const page = this.hiddenPages.get(pageId);
    if (!page) return null;
    
    page.status = 'COMPLETED';
    page.completionMark = true;
    this.completionCount++;
    
    return page;
  }
  
  /**
   * Generar imagen/visualización del estado
   * 发图片 - Generar representación visual
   */
  generateImage(pageId: string): string {
    const page = this.hiddenPages.get(pageId);
    if (!page) return this.renderEmptyImage();
    
    const status = page.status;
    const mark = page.completionMark ? '✓ COMPLETED' : '○ PENDING';
    
    return `
╔══════════════════════════════════════════════════╗
║  HIDDEN STATE VISUALIZATION / 隐藏状态可视化       ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║     [${page.imageHash}]                           ║
║                                                  ║
║  Title: ${page.title.slice(0, 35).padEnd(35)}   ║
║  Status: ${status.padEnd(35)}                   ║
║  Depth: ${'█'.repeat(page.hiddenDepth)}${'░'.repeat(10-page.hiddenDepth)} ${page.hiddenDepth}/10     ║
║                                                  ║
║  ${mark}                                       ║
║                                                  ║
║  Access: ${page.accessCode}                      ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`;
  }
  
  /**
   * Finalizar/Revelar contenido oculto
   * finish the matter
   */
  finishMatter(pageId: string): { finished: boolean; revealed: string } {
    const page = this.hiddenPages.get(pageId);
    if (!page) return { finished: false, revealed: 'Page not found' };
    
    page.status = 'REVEALED';
    
    return {
      finished: true,
      revealed: `
═══════════════════════════════════════════════════
MATTER FINISHED / 事项已完成
═══════════════════════════════════════════════════

Page: ${page.title}
ID: ${page.id}
Status: ${page.status}
Completion: ${page.completionMark ? '✓ YES' : '✗ NO'}

Content:
${page.content}

═══════════════════════════════════════════════════
`
    };
  }
  
  /**
   * Obtener todas las páginas ocultas marcadas
   */
  getMarkedPages(): HiddenPage[] {
    return Array.from(this.hiddenPages.values())
      .filter(p => p.completionMark)
      .sort((a, b) => b.hiddenDepth - a.hiddenDepth);
  }
  
  private generateImageHash(title: string, content: string): string {
    const combined = title + content + Date.now().toString();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 8).toUpperCase();
  }
  
  private generateAccessCode(): string {
    return 'H-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  
  private renderEmptyImage(): string {
    return `
╔══════════════════════════════════════════════════╗
║  HIDDEN STATE: EMPTY                            ║
║  [NO IMAGE DATA]                                ║
╚══════════════════════════════════════════════════╝
`;
  }
  
  dispose(): void {
    this.hiddenPages.clear();
    this.completionCount = 0;
  }
}

export const hiddenMarker = new HiddenStateMarker();
