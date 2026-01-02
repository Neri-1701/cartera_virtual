import { useEffect, useMemo, useState } from 'react';
import { storageService } from '../services/storage';
import type { Movement } from '../types/movement';

export type MovementInput = Omit<Movement, 'id' | 'createdAt' | 'updatedAt'>;

export const useTransactions = () => {
  const [movements, setMovements] = useState<Movement[]>(() => storageService.load());

  useEffect(() => {
    storageService.save(movements);
  }, [movements]);

  const addMovement = (movement: MovementInput) => {
    setMovements((prev) => [
      ...prev,
      {
        ...movement,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]);
  };

  const updateMovement = (id: string, payload: MovementInput) => {
    setMovements((prev) =>
      prev.map((movement) =>
        movement.id === id
          ? {
              ...movement,
              ...payload,
              updatedAt: Date.now()
            }
          : movement
      )
    );
  };

  const deleteMovement = (id: string) => {
    setMovements((prev) => prev.filter((movement) => movement.id !== id));
  };

  const replaceAll = (items: Movement[]) => {
    setMovements(items);
  };

  const stats = useMemo(() => {
    const income = movements.filter((item) => item.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
    // Only consider immediate/debit expenses for the current balance
    const expense = movements
      .filter((item) => item.type === 'EXPENSE' && ((item as any).paymentMethod ?? 'DEBIT') === 'DEBIT')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      income,
      expense,
      balance: income - expense
    };
  }, [movements]);

  return {
    movements,
    addMovement,
    updateMovement,
    deleteMovement,
    replaceAll,
    stats
  };
};
