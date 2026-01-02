export type MovementType = 'INCOME' | 'EXPENSE';

export interface Movement {
  id: string;
  date: string; // YYYY-MM-DD
  concept: string;
  category: string;
  amount: number;
  type: MovementType;
  notes?: string;
  // Optional fields for card / MSI support
  paymentMethod?: 'DEBIT' | 'CREDIT';
  cardId?: string;
  isMSI?: boolean;
  months?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Filters {
  from?: string;
  to?: string;
  category?: string;
}
