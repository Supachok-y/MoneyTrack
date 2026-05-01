# MoneyTrack

แอปพลิเคชัน Android สำหรับติดตามรายรับ-รายจ่ายอัตโนมัติ โดยอ่านและแปลง SMS จากธนาคารกสิกรไทย (KBank) แบบ Real-time

## ภาพรวม

MoneyTrack อ่าน SMS แจ้งเตือนธุรกรรมจาก KBank แล้วแปลงเป็นข้อมูลรายรับ-รายจ่ายโดยอัตโนมัติ พร้อมแสดงสรุปรายวันพร้อมยอดรวม ออกแบบมาให้ใช้งานง่าย รองรับผู้สูงอายุ

## ฟีเจอร์หลัก

- **อ่าน SMS อัตโนมัติ** — รองรับทั้งกล่องข้อความเก่าและ SMS ที่เข้ามาใหม่แบบ Real-time
- **แยกแยะรายรับ/รายจ่าย** — ตรวจจับจาก keyword "เงินเข้า", "เงินออก", "หักบช"
- **สรุปรายวัน** — ดูยอดรวมรายรับ รายจ่าย และจำนวนธุรกรรมของแต่ละวัน
- **เลื่อนดูย้อนหลัง** — กดปุ่มเพื่อข้ามไปดูวันอื่น
- **ดู SMS ต้นฉบับ** — แตะที่รายการเพื่อดูข้อความ SMS เต็ม
- **กรองข้อความต้องสงสัย** — บล็อก phishing/scam โดยอัตโนมัติ

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Framework | React Native 0.85.2 |
| Language | TypeScript 5.8.3 |
| State Management | Zustand 5.0.12 |
| Native Module | Java (Android BroadcastReceiver) |
| Min Android | API 24 (Android 7.0) |
| Target Android | API 36 (Android 15) |

## โครงสร้างโปรเจ็ค

```
MoneyTrack/
├── App.tsx                    # Entry point, ขอ permission และโหลด SMS เก่า
├── Screens/
│   └── SummaryScreen.tsx      # หน้าหลัก แสดงสรุปรายวัน
├── store/
│   └── useTransactionStore.ts # Zustand store สำหรับเก็บธุรกรรม
├── utils/
│   └── smsParser.ts           # แปลง SMS เป็น Transaction object
├── types/
│   └── transaction.ts         # TypeScript interfaces
└── android/app/src/main/java/com/moneytrack/
    ├── SMSModule.java          # React Native bridge
    ├── SMSPackage.java         # Module registration
    └── SMSReceiver.java        # Android BroadcastReceiver
```

## Data Flow

```
SMS เข้า
  └─► SMSReceiver (Java BroadcastReceiver)
        └─► SMSModule (Native Bridge)
              └─► App.tsx / Event Listener
                    └─► parseSMS() [utils/smsParser.ts]
                          └─► addTransaction() [Zustand Store]
                                └─► SummaryScreen (Re-render)
```

## ความปลอดภัยในการแปลง SMS

`smsParser.ts` มีการกรองหลายชั้นก่อนจะยอมรับ SMS:

1. **ตรวจผู้ส่ง** — รับเฉพาะจาก `"KBank"` เท่านั้น
2. **บล็อก URL** — ปฏิเสธข้อความที่มีลิงก์ (ป้องกัน phishing)
3. **กรอง keyword อันตราย** — บล็อกคำที่ใช้ในมิจฉาชีพกว่า 34 คำ เช่น `ด่วน`, `รางวัล`, `OTP`, `password`, `วงเงิน`
4. **ตรวจ Pattern** — ต้องมี keyword ธุรกรรมที่ถูกต้อง
5. **Regex Validation** — ตรวจรูปแบบวันที่ เวลา และจำนวนเงินอย่างเคร่งครัด
6. **ป้องกัน Duplicate** — เช็ค `rawMessage` ก่อนเพิ่มรายการซ้ำ

## โครงสร้างข้อมูล

```typescript
interface Transaction {
  id: string;              // sms-{timestamp}-{random}
  date: string;            // DD/MM/YY (ปีพุทธศักราช)
  time: string;            // HH:mm
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  bank: string;            // "KBank"
  rawMessage: string;      // SMS ต้นฉบับ
  isSuspicious: boolean;
}
```

## การติดตั้งและ Build

### ความต้องการเบื้องต้น

- Node.js 18+
- Java Development Kit (JDK) 17+
- Android Studio + Android SDK
- React Native CLI

### ติดตั้ง Dependencies

```bash
npm install
```

### Run บน Emulator หรืออุปกรณ์จริง

```bash
# เริ่ม Metro bundler
npm start

# Build และติดตั้งบน Android (terminal ใหม่)
npm run android
```

### Build APK (Release)

```bash
cd android
./gradlew assembleRelease
```

ไฟล์ APK จะอยู่ที่: `android/app/build/outputs/apk/release/app-release.apk`

## Permissions ที่ใช้

| Permission | เหตุผล |
|-----------|--------|
| `READ_SMS` | อ่านประวัติ SMS ในกล่องข้อความ |
| `RECEIVE_SMS` | รับ SMS ใหม่แบบ Real-time |

## ข้อกำหนดการใช้งาน

- รองรับเฉพาะ SMS จาก **ธนาคารกสิกรไทย (KBank)** เท่านั้น
- รูปแบบวันที่ใช้ **ปฏิทินพุทธศักราช** (ค.ศ. + 543)
- รองรับเฉพาะ **Android** (iOS ไม่อนุญาตให้แอปอ่าน SMS)

## Version History

| Version | รายละเอียด |
|---------|-----------|
| 1.2 (versionCode 4) | Real-time SMS listener + Elderly-friendly UI |
| 1.1 (versionCode 3) | SMS detail toggle + Auto date update on app active |
| 1.0 (versionCode 1-2) | KBank SMS parser + Summary dashboard |
