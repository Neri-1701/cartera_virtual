export interface Card {
  id: string | number;
  name: string;
  cutDay: number;
  payDay: number;
}

export const DEFAULT_CARDS: Card[] = [
  { id: '1', name: 'Nu', cutDay: 10, payDay: 20 },
  { id: '2', name: 'BBVA Oro', cutDay: 22, payDay: 12 }
];

import { parseISODateToLocal } from './format';

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

export function calculatePaymentDate(purchaseDateStr: string, cardId?: string | number, cards: Card[] = DEFAULT_CARDS): Date {
  const purchaseDate = parseISODateToLocal(purchaseDateStr);
  if (!cardId) return purchaseDate;

  const card = cards.find((c) => String(c.id) === String(cardId));
  if (!card) return purchaseDate;

  const cutDateThisMonth = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), card.cutDay);

  let basePaymentMonth: Date;
  if (purchaseDate <= cutDateThisMonth) {
    basePaymentMonth = addMonths(cutDateThisMonth, 1);
  } else {
    basePaymentMonth = addMonths(cutDateThisMonth, 2);
  }

  return new Date(basePaymentMonth.getFullYear(), basePaymentMonth.getMonth(), card.payDay);
}

import type { Movement } from '../types/movement';

export interface ProjectionRow extends Movement {
  impactDate: Date;
  impactMonthStr: string; // YYYY-MM
  category: 'Flujo Directo' | 'Crédito Directo' | 'MSI';
}

function monthKeyFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function generateProjection(movements: Movement[], cards: Card[] = DEFAULT_CARDS): ProjectionRow[] {
  const projection: ProjectionRow[] = [];

  movements.forEach((mov) => {
    const dateObj = parseISODateToLocal(mov.date);

    // If paymentMethod is not provided, treat EXPENSE as DEBIT by default
    const paymentMethod = (mov as any).paymentMethod ?? (mov.type === 'EXPENSE' ? 'DEBIT' : undefined);

    if (paymentMethod === 'DEBIT' || mov.type === 'INCOME') {
      projection.push({
        ...mov,
        impactDate: dateObj,
        impactMonthStr: monthKeyFromDate(dateObj),
        category: 'Flujo Directo'
      } as ProjectionRow);
    } else if (paymentMethod === 'CREDIT') {
      const firstPaymentDate = calculatePaymentDate(mov.date, (mov as any).cardId, cards);

      if (!(mov as any).isMSI) {
        projection.push({
          ...mov,
          impactDate: firstPaymentDate,
          impactMonthStr: monthKeyFromDate(firstPaymentDate),
          category: 'Crédito Directo'
        } as ProjectionRow);
      } else {
        const months = (mov as any).months ?? 1;
        const monthlyAmount = mov.amount / months;
        for (let i = 0; i < months; i++) {
          const paymentDate = addMonths(firstPaymentDate, i);
          projection.push({
            ...mov,
            amount: monthlyAmount,
            concept: `${mov.concept} (${i + 1}/${months})`,
            impactDate: paymentDate,
            impactMonthStr: monthKeyFromDate(paymentDate),
            category: 'MSI'
          } as ProjectionRow);
        }
      }
    }
  });

  return projection.sort((a, b) => a.impactDate.getTime() - b.impactDate.getTime());
}
