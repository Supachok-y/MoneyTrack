package com.moneytrack;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;

public class SMSModule extends ReactContextBaseJavaModule {
    private SMSReceiver smsReceiver;

    SMSModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "SMSModule";
    }

    // ✅ เพิ่ม: เปิด Listener รับ SMS แบบ Real-time
    @ReactMethod
    public void startSMSListener(Promise promise) {
        try {
            smsReceiver = new SMSReceiver(getReactApplicationContext());
            IntentFilter filter = new IntentFilter("android.provider.Telephony.SMS_RECEIVED");
            filter.setPriority(999);
            getReactApplicationContext().registerReceiver(smsReceiver, filter);
            promise.resolve("SMS Listener started");
        } catch (Exception e) {
            promise.reject("SMS_LISTENER_ERROR", e.getMessage());
        }
    }

    // ✅ เพิ่ม: ปิด Listener เมื่อไม่ใช้
    @ReactMethod
    public void stopSMSListener(Promise promise) {
        try {
            if (smsReceiver != null) {
                getReactApplicationContext().unregisterReceiver(smsReceiver);
                smsReceiver = null;
            }
            promise.resolve("SMS Listener stopped");
        } catch (Exception e) {
            promise.reject("SMS_LISTENER_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getAllSMS(Promise promise) {
        // โค้ดเดิมไม่ต้องแก้ครับ
        try {
            Uri uriSms = Uri.parse("content://sms/inbox");
            Cursor cursor = getReactApplicationContext().getContentResolver()
                    .query(uriSms, null, null, null, "date DESC");
            StringBuilder allMessages = new StringBuilder();
            if (cursor != null && cursor.moveToFirst()) {
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
            promise.reject("SMS_ERROR", e.getMessage());
        }
    }
}