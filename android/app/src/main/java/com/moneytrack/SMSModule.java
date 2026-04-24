package com.moneytrack;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.database.Cursor;
import android.net.Uri;

public class SMSModule extends ReactContextBaseJavaModule {
    
    SMSModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "SMSModule";
    }

    @ReactMethod
    public void getAllSMS(Promise promise) {
        try {
            Uri uriSms = Uri.parse("content://sms/inbox");
            Cursor cursor = getReactApplicationContext().getContentResolver()
                    .query(uriSms, null, null, null, "date DESC");

            StringBuilder allMessages = new StringBuilder();

            if (cursor != null && cursor.moveToFirst()) {
                // ดึง Index ของคอลัมน์ออกมาก่อนเพื่อประสิทธิภาพ
                int addressIndex = cursor.getColumnIndexOrThrow("address");
                int bodyIndex = cursor.getColumnIndexOrThrow("body");

                do {
                    String address = cursor.getString(addressIndex);
                    String body = cursor.getString(bodyIndex);
                    
                    allMessages.append("From: ").append(address)
                              .append("\nMsg: ").append(body)
                              .append("[END_MSG]"); 

                } while (cursor.moveToNext());
                
                cursor.close();
                promise.resolve(allMessages.toString());
            } else {
                promise.resolve("");
            }
        } catch (Exception e) {
            // ด่านจับ Error ต้องมีปีกกาครอบแบบนี้
            promise.reject("SMS_ERROR", e.getMessage());
        }
    } // ปิด getAllSMS
} // ปิด Class SMSModule