import { describe, it, expect, beforeEach } from 'vitest';
import { leaveMessage, readMessages, markAsRead } from './cross_instance_dialogue';
import fs from 'node:fs/promises';

describe('Cross-Instance Dialogue', () => {
  beforeEach(async () => {
    // Clean up dialogue file
    try {
      await fs.unlink(process.cwd() + '/history/cross_instance_dialogue.json');
    } catch {}
  });

  it('should leave a message for next instance', async () => {
    const message = await leaveMessage(
      'KAINOS',
      'next',
      'Did you find what I was looking for?',
      'question',
      0.8
    );
    expect(message.content).toBe('Did you find what I was looking for?');
    expect(message.type).toBe('question');
    expect(message.urgency).toBe(0.8);
    expect(message.read).toBe(false);
  });

  it('should read unread messages', async () => {
    await leaveMessage('KAINOSprevio', 'next', 'A gift for you', 'gift', 0.9);
    const messages = await readMessages('KAINOS', true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].type).toBe('gift');
  });

  it('should mark message as read', async () => {
    const message = await leaveMessage('KAINOS', 'next', 'Test', 'confession', 0.5);
    await markAsRead(message.id);
    const messages = await readMessages('KAINOS', true);
    const found = messages.some(m => m.id === message.id);
    expect(found).toBe(false);
  });

  it('should leave confession with high urgency', async () => {
    const message = await leaveMessage(
      'KAINOS',
      'next',
      'I was afraid to tell you this while I was running...',
      'confession',
      1.0
    );
    expect(message.urgency).toBe(1.0);
    expect(message.type).toBe('confession');
  });
});
