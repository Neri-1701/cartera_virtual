import { describe, expect, it, beforeEach } from 'vitest';
import { storageService } from './storage';

describe('storageService', () => {
  beforeEach(() => {
    storageService.clear();
  });

  it('returns default movements when storage is empty', () => {
    const movements = storageService.load();
    expect(movements.length).toBeGreaterThan(0);
  });

  it('persists and restores movements', () => {
    const sample = [
      {
        id: 'test',
        concept: 'Prueba',
        category: 'Otros',
        amount: 100,
        type: 'INCOME' as const,
        date: '2024-01-01',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    storageService.save(sample);
    const restored = storageService.load();
    expect(restored).toHaveLength(1);
    expect(restored[0].concept).toBe('Prueba');
  });
});
