export interface Card {
  id: string | number;
  name: string;
  cutDay: number; // day of month when the cut happens (1-31)
  paymentGapDays?: number; // days after cut for payment due (default: 10)
  cycleDays?: number; // cycle length in days (default: 30)
}

export const DEFAULT_CARDS: Card[] = [
  { id: '1', name: 'Nu', cutDay: 10, paymentGapDays: 10, cycleDays: 30 },
  { id: '2', name: 'HSBC Air', cutDay: 22, paymentGapDays: 10, cycleDays: 30 }
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

  const cutDay = card.cutDay;
  const gap = card.paymentGapDays ?? 10;

  // Determine the cut date for the purchase month
  const cutDateThisMonth = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), cutDay);

  // If purchase happens on or before the cut date, payment is for this cycle's cut, otherwise next cycle
  let relevantCutDate: Date;
  if (purchaseDate <= cutDateThisMonth) {
    relevantCutDate = cutDateThisMonth;
  } else {
    relevantCutDate = addMonths(cutDateThisMonth, 1);
  }

  // Payment date is cut date + gap days
  const paymentDate = new Date(relevantCutDate.getFullYear(), relevantCutDate.getMonth(), relevantCutDate.getDate() + gap);
  return paymentDate;
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
