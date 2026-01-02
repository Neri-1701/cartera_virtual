import { describe, it, expect } from 'vitest';
import { generateProjection, calculatePaymentDate, addMonths } from './finance';

const cards = [
  { id: '1', name: 'Nu', cutDay: 10, paymentGapDays: 10, cycleDays: 30 },
  { id: '2', name: 'BBVA', cutDay: 22, paymentGapDays: 10, cycleDays: 30 }
];

describe('finance utils', () => {
  it('adds months correctly', () => {
    const now = new Date(2024, 0, 15); // Jan 15 2024
    const plus2 = addMonths(now, 2);
    expect(plus2.getMonth()).toBe(2); // March
  });

  it('calculates payment date based on cut and gap days', () => {
    const purchase1 = '2024-01-05'; // before cut day 10
    const pd1 = calculatePaymentDate(purchase1, '1', cards as any);
    expect(pd1.getFullYear()).toBe(2024);
    expect(pd1.getMonth()).toBe(0); // January
    expect(pd1.getDate()).toBe(20); // 10 + 10 gap = 20

    const purchase2 = '2024-01-15'; // after cut day 10
    const pd2 = calculatePaymentDate(purchase2, '1', cards as any);
    expect(pd2.getFullYear()).toBe(2024);
    expect(pd2.getMonth()).toBe(1); // February
    expect(pd2.getDate()).toBe(20);
  });

  it('explodes MSI into monthly pieces', () => {
    const movements: any = [
      { id: 'm1', date: '2024-01-05', concept: 'TV', amount: 1200, type: 'EXPENSE', paymentMethod: 'CREDIT', cardId: '1', isMSI: true, months: 3 }
    ];

    const proj = generateProjection(movements, cards as any);
    expect(proj.length).toBe(3);
    const totals = proj.reduce((s, p) => s + p.amount, 0);
    expect(Math.round(totals)).toBe(1200);
  });
});
