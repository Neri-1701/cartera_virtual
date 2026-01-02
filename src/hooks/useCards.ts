import { useEffect, useState } from 'react';
import type { Card } from '../types/card';
import { storageService } from '../services/storage';

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>(() => storageService.loadCards());

  useEffect(() => {
    // Subscribe/refresh on mount
    setCards(storageService.loadCards());
  }, []);

  const addCard = (payload: Omit<Card, 'id'>) => {
    const newCard: Card = { ...payload, id: Date.now().toString() };
    const updated = [...cards, newCard];
    setCards(updated);
    storageService.saveCards(updated);
    return newCard;
  };

  const updateCard = (id: string, updates: Partial<Card>) => {
    const updated = cards.map((c) => (String(c.id) === String(id) ? { ...c, ...updates } : c));
    setCards(updated);
    storageService.saveCards(updated);
  };

  const deleteCard = (id: string) => {
    const updated = cards.filter((c) => String(c.id) !== String(id));
    setCards(updated);
    storageService.saveCards(updated);
  };

  return { cards, addCard, updateCard, deleteCard } as const;
};
