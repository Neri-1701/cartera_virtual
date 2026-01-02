import type { Movement } from '../types/movement';

const STORAGE_KEY = 'cartera_virtual_state';
const CURRENT_VERSION = 1;

interface StoredState {
  version: number;
  movements: Movement[];
}

const buildDefaultMovements = (): Movement[] => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    .toISOString()
    .slice(0, 10);

  return [
    {
      id: 'income-fixed',
      concept: 'Ingreso fijo',
      category: 'Ingresos',
      amount: 30000,
      type: 'INCOME',
      date: todayStr,
      notes: 'Referencia base del HTML original',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'groceries',
      concept: 'Supermercado semanal',
      category: 'Hogar',
      amount: 2500,
      type: 'EXPENSE',
      date: todayStr,
      notes: 'Conversión de movimiento de débito',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'dinner',
      concept: 'Cena restaurante',
      category: 'Entretenimiento',
      amount: 1200,
      type: 'EXPENSE',
      date: todayStr,
      notes: 'Conversión de compra con crédito',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'crib',
      concept: 'Cuna bebé (MSI)',
      category: 'Familia',
      amount: 1000,
      type: 'EXPENSE',
      date: lastMonth,
      notes: 'MSI prorrateado para efectos de control',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];
};

const getEmptyState = (): StoredState => ({
  version: CURRENT_VERSION,
  movements: buildDefaultMovements()
});

const migrate = (state: StoredState | null): StoredState => {
  if (!state || typeof state.version !== 'number') {
    return getEmptyState();
  }

  if (state.version === CURRENT_VERSION) {
    // Normalize movements so older saved state gains new optional fields gracefully
    const normalized: StoredState = {
      ...state,
      movements: state.movements.map((m) => ({
        ...m,
        paymentMethod: (m as any).paymentMethod ?? (m.type === 'EXPENSE' ? 'DEBIT' : undefined),
        cardId: (m as any).cardId ?? undefined,
        isMSI: (m as any).isMSI ?? false,
        months: (m as any).months ?? 0
      }))
    };
    return normalized;
  }

  // Placeholder for future migrations. For now, reset to defaults when version mismatch occurs.
  return getEmptyState();
};

const readStorage = (): StoredState | null => {
  if (typeof localStorage === 'undefined') return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredState;
  } catch (error) {
    console.warn('No se pudo parsear el estado guardado, se usará el predeterminado.', error);
    return null;
  }
};

export const storageService = {
  load(): Movement[] {
    const migrated = migrate(readStorage());
    return migrated.movements;
  },
  save(movements: Movement[]): void {
    if (typeof localStorage === 'undefined') return;

    const payload: StoredState = {
      version: CURRENT_VERSION,
      movements
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },
  clear(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
};
