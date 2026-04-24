import { Transaction } from "../types/transaction"

export const parseSMS = (rawString: string | null): Transaction | null => {
  if (!rawString) return null;

  const parts: string[] = rawString.split('\nMsg: ');
  const sender: string = parts[0].replace('From: ', '').trim();
  const message: string = parts[1] || "";

  // 1. ตรวจสอบ Sender ID อย่างเข้มงวด (ป้องกัน Homograph Attack)
  // ในเครื่องจริง 'KBank' ต้องสะกดด้วยอักษรภาษาอังกฤษปกติเท่านั้น
  if (sender !== 'KBank') return null;

  // 2. Security Check: ปฏิเสธข้อความที่มีลิงก์ (URL) ทันที
  // ป้องกันมิจฉาชีพส่งลิงก์หลอกล่อผ่าน SMS
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\.ly\/|\.com\/|\.net\/|\.in\.th\/)/i;
  if (urlRegex.test(message)) {
    return null;
  }

  // 3. Security Check: ปฏิเสธข้อความที่มี Keyword สร้างความตระหนกหรือหลอกล่อ
const dangerKeywords = [
  // 1. กลุ่มกระตุ้นให้กด (Call to Action / Phishing)
  'ด่วน', 'คลิก', 'ตรวจสอบ', 'อัปเดต', 'ล็อกอิน', 'login', 'update', 'ยืนยันตัวตน', 'คลิ๊ก', 'กดรับ', 'รับสิทธิ์',
  
  // 2. กลุ่มหลอกลวงหรือคำกำกวม (Scam / Suspicious)
  'เหยื่อ', 'รางวัล', 'ผู้โชคดี', 'โบนัส', 'ฟรี', 'voucher', 'แจก', 'คืนเงิน', 'cashback', 'คะแนนสะสม', 'แต้ม',
  
  // 3. กลุ่มสินเชื่อและวงเงิน (Ambiguous Credit/Loan)
  'วงเงิน', 'กู้', 'สินเชื่อ', 'อนุมัติ', 'ยื่นกู้', 'พร้อมใช้', 'ชำระขั้นต่ำ', 'ค้างชำระ', 'งวด',
  
  // 4. กลุ่มความปลอดภัยและระบบ (Security/System)
  'รหัสผ่าน', 'password', 'otp', 'ref', 'รหัสอ้างอิง', 'ยกเลิกรายการ', 'ไม่สำเร็จ', 'ปฏิเสธ'
];

// ฟังก์ชันกรองข้อมูล (ใส่ไว้ใน smsParser.ts)
const isDangerous = (message: string): boolean => {
  // ตรวจสอบว่าในข้อความมีคำใดคำหนึ่งใน dangerKeywords หรือไม่
  return dangerKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
};

// การใช้งานใน Logic หลัก
if (isDangerous(message)) {
  return null; // ข้ามข้อความนี้ไปเลย
}

  // 4. ตรวจสอบรูปแบบธุรกรรม (Strict Pattern Matching)
  const isIncome = /เงินเข้า|รับโอน/.test(message);
  const isExpense = /เงินออก|หักบช/.test(message);
  if (!isIncome && !isExpense) return null;

  // 5. ดึงข้อมูลด้วย Regex ที่ระบุตำแหน่งชัดเจนขึ้น
  // วันที่ (dd/mm/yy) และ เวลา (hh:mm)
  const dateMatch = message.match(/(\d{2}\/\d{2}\/\d{2})/);
  const timeMatch = message.match(/(\d{2}:\d{2})/);
  
  // ยอดเงิน: ต้องอยู่ระหว่างตัวคั่นที่แน่นอนของธนาคาร 
  // เช่น "...จำนวน [ยอดเงิน] บาท..." หรือ "...[ยอดเงิน] คงเหลือ..."
  // ป้องกันมิจฉาชีพสุ่มตัวเลขมาหลอกระบบ
  const amountMatch = message.match(/([\d,]+\.\d{2})\s+บาท|([\d,]+\.\d{2})\s+คงเหลือ/);

  if (!dateMatch || !timeMatch || !amountMatch) return null;

  // เลือกค่าจากกลุ่มที่ Match ได้ (ป้องกันค่า null จาก Alternative Group ใน Regex)
  const finalAmount = amountMatch[1] || amountMatch[2];

  return {
    id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    date: dateMatch[0],
    time: timeMatch[0],
    amount: parseFloat(finalAmount.replace(/,/g, '')),
    type: isIncome ? 'INCOME' : 'EXPENSE',
    bank: 'KBank',
    rawMessage: message,
    isSuspicious: false // สามารถเพิ่ม flag นี้ไว้ใน Type เพื่อแสดง Warning ใน UI ได้
  };
};