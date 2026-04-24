import { create } from 'zustand';
import { Transaction, DailyStats } from '../types/transaction';

interface TransactionState {
  transactions: Transaction[];
  selectedDate: string;
  expandedId: string | null; // เพิ่ม: สำหรับเก็บ ID รายการที่ถูกเปิดอยู่
  addTransaction: (data: Transaction) => void;
  setSelectedDate: (date: string) => void;
  toggleExpand: (id: string) => void; // เพิ่ม: ฟังก์ชันสำหรับกดเปิด/ปิด
  getStatsByDate: () => DailyStats;
}

// ฟังก์ชันสำหรับสร้างวันที่ปัจจุบันในฟอร์แมต DD/MM/YY (ปีไทย)
const getTodayThaiDate = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear() + 543).slice(-2);
  return `${d}/${m}/${y}`;
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  selectedDate: getTodayThaiDate(),
  expandedId: null, // เริ่มต้นไม่มีการเปิด

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

  toggleExpand: (id) => set((state) => ({
    expandedId: state.expandedId === id ? null : id 
  })),

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