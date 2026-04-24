import { create } from 'zustand';
import { Transaction, DailyStats } from '../types/transaction';

interface TransactionState {
  transactions: Transaction[];
  selectedDate: string;
  // Actions
  addTransaction: (data: Transaction) => void;
  setSelectedDate: (date: string) => void;
  // Selectors (ช่วยดึงข้อมูลตามเงื่อนไขข้อ 1-4)
  getStatsByDate: () => DailyStats;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  selectedDate: '24/04/69', // วันที่เริ่มต้นทดสอบ

  addTransaction: (data) => {
    // ป้องกันการเพิ่มข้อมูลซ้ำจากข้อความเดิม
    const isDuplicate = get().transactions.some(t => t.rawMessage === data.rawMessage);
    if (!isDuplicate) {
      set((state) => ({
        transactions: [data, ...state.transactions],
      }));
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  getStatsByDate: () => {
    const { transactions, selectedDate } = get();
    
    // ข้อ 3: กรองรายการเฉพาะวันที่เลือก
    const filteredList = transactions.filter((t) => t.date === selectedDate);
    
    const incomeList = filteredList.filter((t) => t.type === 'INCOME');
    const expenseList = filteredList.filter((t) => t.type === 'EXPENSE');

    return {
      list: filteredList,
      totalIncome: incomeList.reduce((sum, t) => sum + t.amount, 0), // ข้อ 2
      totalExpense: expenseList.reduce((sum, t) => sum + t.amount, 0), // ข้อ 2
      countIncome: incomeList.length, // ข้อ 4
      countExpense: expenseList.length, // ข้อ 4
    };
  },
}));