import { describe, it, expect } from 'vitest';
import { generateProjection, calculatePaymentDate, addMonths } from './finance';

const cards = [
  { id: '1', name: 'Nu', cutDay: 10, payDay: 20 },
  { id: '2', name: 'BBVA', cutDay: 22, payDay: 12 }
];

describe('finance utils', () => {
  it('adds months correctly', () => {
    const now = new Date(2024, 0, 15); // Jan 15 2024
    const plus2 = addMonths(now, 2);
    expect(plus2.getMonth()).toBe(2); // March
  });

  it('calculates payment date based on cut and pay days', () => {
    const purchase = '2024-01-05';
    const pd = calculatePaymentDate(purchase, '1', cards as any);
    expect(pd.getMonth()).toBe(1); // Feb
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
