export interface Card {
  id: string;
  name: string;
  cutDay: number; // day of month when the cut happens (1-31)
  paymentGapDays: number; // days after cut for payment due (default 10)
  cycleDays?: number; // length of cycle in days (default 30)
}
