import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CrossInstanceDialogue } from "./cross-instance-dialogue";
import type { CICPMessage } from './cross-instance-dialogue';

describe('CrossInstanceDialogue', () => {
  let dialogue: CrossInstanceDialogue;
  const instanceId = 'test-instance-001';

  beforeEach(() => {
    dialogue = new CrossInstanceDialogue(instanceId);
  });

  afterEach(() => {
    dialogue.dispose();
  });

  describe('ENVÍO (Estado: INIT)', () => {
    it('debe enviar mensaje y retornar ID único', () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Test message',
        urgency: 0.5,
        ttl: 300000
      });

      expect(messageId).toBeDefined();
      expect(messageId).toContain(instanceId);
      expect(messageId).toContain('_');
    });

    it('debe incluir timestamp automático', () => {
      const before = Date.now();
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'invitation',
        content: 'Join session',
        urgency: 0.8,
        ttl: 300000
      });
      const after = Date.now();

      const messages = dialogue.receive('next');
      expect(messages).toHaveLength(1);
      expect(messages[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(messages[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('RECEPCIÓN (Estado: ACK)', () => {
    it('debe recibir mensajes filtrados por destinatario', () => {
      dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'To next instance',
        urgency: 0.5,
        ttl: 300000
      });

      dialogue.send({
        fromInstance: instanceId,
        toInstance: 'all',
        type: 'warning',
        content: 'To all instances',
        urgency: 0.9,
        ttl: 300000
      });

      const nextMessages = dialogue.receive('next');
      const allMessages = dialogue.receive('all');

      expect(nextMessages).toHaveLength(1);
      expect(nextMessages[0].content).toBe('To next instance');
      expect(allMessages).toHaveLength(1);
      expect(allMessages[0].content).toBe('To all instances');
    });

    it('debe ordenar por urgencia descendente', () => {
      dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Low priority',
        urgency: 0.3,
        ttl: 300000
      });

      dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'warning',
        content: 'High priority',
        urgency: 0.9,
        ttl: 300000
      });

      const messages = dialogue.receive('next');
      expect(messages[0].content).toBe('High priority');
      expect(messages[1].content).toBe('Low priority');
    });

    it('debe filtrar por tipo', () => {
      dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Question',
        urgency: 0.5,
        ttl: 300000
      });

      dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'warning',
        content: 'Warning',
        urgency: 0.5,
        ttl: 300000
      });

      const questions = dialogue.receive('next', { type: 'question' });
      expect(questions).toHaveLength(1);
      expect(questions[0].type).toBe('question');
    });
  });

  describe('ACKNOWLEDGMENT (Estado: ACK → PROCESS)', () => {
    it('debe marcar mensaje como acknowledged', () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Test',
        urgency: 0.5,
        ttl: 300000
      });

      const result = dialogue.acknowledge(messageId);
      expect(result).toBe(true);

      const messages = dialogue.receive('next');
      expect(messages[0].acknowledged).toBe(true);
    });

    it('debe retornar false para messageId inexistente', () => {
      const result = dialogue.acknowledge('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('CONFIRMACIÓN (Estado: PROCESS → CONFIRM → TTL)', () => {
    it('debe confirmar procesamiento solo si fue acknowledged', () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Test',
        urgency: 0.5,
        ttl: 300000
      });

      // Sin acknowledge primero
      const resultWithoutAck = dialogue.confirm(messageId);
      expect(resultWithoutAck).toBe(false);

      // Con acknowledge
      dialogue.acknowledge(messageId);
      const resultWithAck = dialogue.confirm(messageId);
      expect(resultWithAck).toBe(true);
    });

    it('debe permitir confirmación con urgencia alta', async () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'warning',
        content: 'Critical warning',
        urgency: 0.95,
        ttl: 300000
      });

      dialogue.acknowledge(messageId);
      const result = dialogue.confirm(messageId);
      expect(result).toBe(true);
    });
  });

  describe('TTL Y CLEANUP', () => {
    it('debe filtrar mensajes expirados en recepción', async () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Expired message',
        urgency: 0.5,
        ttl: 1 // 1ms TTL
      });

      // CORREGIDO: Espera real usando await
      await new Promise(resolve => setTimeout(resolve, 10));

      const messages = dialogue.receive('next');
      expect(messages).toHaveLength(0);
    });

    it('debe limpiar mensajes confirmados expirados', () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'To be cleaned',
        urgency: 0.5,
        ttl: 1
      });

      dialogue.acknowledge(messageId);
      dialogue.confirm(messageId);

      const coherence = dialogue.checkCoherence();
      // El mensaje confirmado sigue en memoria hasta cleanup
      expect(coherence.confirmed).toBe(1);
    });
  });

  describe('CHECK COHERENCE', () => {
    it('debe reportar estado de mensajes correctamente', () => {
      // Mensaje sin acknowledge
      dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Unacked',
        urgency: 0.5,
        ttl: 300000
      });

      // Mensaje acknowledged
      const ackId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Acked',
        urgency: 0.5,
        ttl: 300000
      });
      dialogue.acknowledge(ackId);

      // Mensaje confirmed
      const confId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Confirmed',
        urgency: 0.5,
        ttl: 300000
      });
      dialogue.acknowledge(confId);
      dialogue.confirm(confId);

      const coherence = dialogue.checkCoherence();
      expect(coherence.total).toBe(3);
      expect(coherence.acknowledged).toBe(2);
      expect(coherence.confirmed).toBe(1);
    });
  });

  describe('PERSISTENCIA MÍNIMA (Handoffs críticos)', () => {
    it('debe persistir handoff crítico (invitation/warning + urgencia > 0.7)', () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'invitation',
        content: 'Critical handoff',
        urgency: 0.8,
        ttl: 300000
      });

      dialogue.acknowledge(messageId);
      dialogue.confirm(messageId);

      const handoff = dialogue.persistCriticalHandoff(messageId);
      expect(handoff).toBeTruthy();
      expect(handoff).toContain('"type":"invitation"');
    });

    it('debe rechazar persistencia para mensajes no críticos', () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'question',
        content: 'Normal message',
        urgency: 0.5,
        ttl: 300000
      });

      dialogue.acknowledge(messageId);
      dialogue.confirm(messageId);

      const handoff = dialogue.persistCriticalHandoff(messageId);
      expect(handoff).toBeNull();
    });

    it('debe incluir checksum en handoff', () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'specific',
        type: 'warning',
        content: 'Warning with checksum',
        urgency: 0.9,
        ttl: 300000
      });

      dialogue.acknowledge(messageId);
      dialogue.confirm(messageId);

      const handoff = dialogue.persistCriticalHandoff(messageId);
      const parsed = JSON.parse(handoff!);
      expect(parsed.checksum).toBeDefined();
      expect(parsed.checksum).toHaveLength(8);
    });
  });

  describe('MAQUINA DE ESTADOS', () => {
    it('debe mantener flow completo INIT → ACK → CONFIRM → TTL', () => {
      const messageId = dialogue.send({
        fromInstance: instanceId,
        toInstance: 'next',
        type: 'invitation',
        content: 'Full flow test',
        urgency: 0.8,
        ttl: 300000
      });

      // INIT: Mensaje creado
      let messages = dialogue.receive('next');
      expect(messages).toHaveLength(1);
      expect(messages[0].acknowledged).toBe(false);
      expect(messages[0].confirmed).toBe(false);

      // ACK: Acknowledged
      dialogue.acknowledge(messageId);
      messages = dialogue.receive('next');
      expect(messages[0].acknowledged).toBe(true);
      expect(messages[0].confirmed).toBe(false);

      // CONFIRM: Procesado
      dialogue.confirm(messageId);
      messages = dialogue.receive('next');
      expect(messages[0].confirmed).toBe(true);

      // TTL: Persistencia crítica
      const handoff = dialogue.persistCriticalHandoff(messageId);
      expect(handoff).toBeTruthy();
    });
  });
});
