import { useMemo } from 'react';
import { generateProjection, type ProjectionRow, DEFAULT_CARDS, type Card } from '../utils/finance';
import { useTransactions } from './useTransactions';

export const useProjection = (cards: Card[] = DEFAULT_CARDS) => {
  const { movements } = useTransactions();

  const projection = useMemo(() => generateProjection(movements, cards), [movements, cards]);

  const monthSummary = useMemo(() => {
    const map = new Map<string, { expense: number; income: number; msi: number }>();
    projection.forEach((row) => {
      const key = row.impactMonthStr;
      const existing = map.get(key) ?? { expense: 0, income: 0, msi: 0 };

      if (row.type === 'INCOME') {
        existing.income += row.amount;
      } else {
        // Treat EXPENSE rows as impact on the month's spending
        existing.expense += row.amount;
        if (row.category === 'MSI') existing.msi += row.amount;
      }

      map.set(key, existing);
    });
    return map;
  }, [projection]);

  function getMonthKPIs(monthStr: string, incomeFixed = 30000, budgetTarget = 25000) {
    const data = monthSummary.get(monthStr) ?? { expense: 0, income: 0, msi: 0 };
    const totalSpent = data.expense; // only expenses count as "spent" against monthly budget
    const totalMSI = data.msi;
    const available = budgetTarget - totalSpent; // budget considers expenses (incl. credits projected)
    const savings = incomeFixed - data.expense; // savings based on debits (expenses)
    return { totalSpent, totalMSI, available, savings };
  }

  return { projection, monthSummary, getMonthKPIs } as {
    projection: ProjectionRow[];
    monthSummary: Map<string, { total: number; msi: number }>;
    getMonthKPIs: (monthStr: string, incomeFixed?: number, budgetTarget?: number) => {
      totalSpent: number;
      totalMSI: number;
      available: number;
      savings: number;
    };
  };
};
