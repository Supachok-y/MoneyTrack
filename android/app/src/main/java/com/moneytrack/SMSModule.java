package com.moneytrack; // กำหนดว่าไฟล์นี้อยู่ที่ไหนในโปรเจกต์

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.database.Cursor;
import android.net.Uri;

public class SMSModule extends ReactContextBaseJavaModule {
    // 1. Constructor: รับค่า Context จาก React Native เพื่อให้ Java ทำงานได้
    SMSModule(ReactApplicationContext context) {
        super(context);
    }

    // 2. ชื่อที่จะใช้เรียกในฝั่ง JavaScript เช่น NativeModules.SMSModule
    @Override
    public String getName() {
        return "SMSModule";
    }

    // 3. ฟังก์ชันที่จะถูกเรียกจาก JS (ต้องมี @ReactMethod)
    @ReactMethod
    public void getLatestSMS(Promise promise) {
        try {
            // ดึงข้อมูลจาก "กล่องข้อความ" (SMS Inbox) ของระบบ Android
            Uri uriSms = Uri.parse("content://sms/inbox");
            Cursor cursor = getReactApplicationContext().getContentResolver()
                    .query(uriSms, null, null, null, "date DESC LIMIT 1"); // ดึงอันล่าสุด 1 อัน

            if (cursor != null && cursor.moveToFirst()) {
                // ดึงข้อความจากคอลัมน์ชื่อ "body"
                String address = cursor.getString(cursor.getColumnIndexOrThrow("address")); // เบอร์ส่งมา
                String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));       // ข้อความ
                
                // ส่งค่ากลับไปหา JavaScript ผ่าน Promise
                promise.resolve("From: " + address + "\nMsg: " + body);
                cursor.close();
            } else {
                promise.resolve("No SMS found");
            }
        } catch (Exception e) {
            // ถ้าพัง (เช่น ลืมขอสิทธิ์) ให้แจ้ง Error กลับไป
            promise.reject("SMS_ERROR", e.getMessage());
        }
    }
}