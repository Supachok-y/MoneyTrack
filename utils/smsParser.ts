import { Transaction } from "../types/transaction"

export const parseSMS = (rawString: string | null): Transaction | null => {
  if (!rawString) return null;

  const parts: string[] = rawString.split('\nMsg: ');
  const sender: string = parts[0].replace('From: ', '').trim();
  const message: string = parts[1] || "";

  if (sender !== 'KBank' && !message.includes('KBank')) return null;

  const isIncome: boolean = /เงินเข้า|รับโอน/.test(message);
  const isExpense: boolean = /เงินออก|หักบช/.test(message);

  if (!isIncome && !isExpense) return null;

  const dateMatch = message.match(/(\d{2}\/\d{2}\/\d{2})/);
  const timeMatch = message.match(/(\d{2}:\d{2})/);
  const amountMatch = message.match(/([\d,]+\.\d{2})\s+คงเหลือ/);

  return {
    id: Math.random().toString(36).substring(2, 9),
    date: dateMatch ? dateMatch[0] : "",
    time: timeMatch ? timeMatch[0] : "",
    amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
    type: isIncome ? 'INCOME' : 'EXPENSE',
    bank: 'KBank',
    rawMessage: message,
  };
};