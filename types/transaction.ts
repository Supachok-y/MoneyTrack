export interface Transaction {
  id: string;
  date: string;     // รูปแบบ "DD/MM/YY"
  time: string;     // รูปแบบ "HH:mm"
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  bank: string;
  rawMessage: string;
}

export interface DailyStats {
  list: Transaction[];
  totalIncome: number;
  totalExpense: number;
  countIncome: number;
  countExpense: number;
}