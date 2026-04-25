package com.moneytrack;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SMSReceiver extends BroadcastReceiver {
    private ReactApplicationContext reactContext;

    public SMSReceiver(ReactApplicationContext context) {
        this.reactContext = context;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle == null) return;

            Object[] pdus = (Object[]) bundle.get("pdus");
            String format = bundle.getString("format");
            if (pdus == null) return;

            for (Object pdu : pdus) {
                SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu, format);
                String sender = sms.getOriginatingAddress();
                String body = sms.getMessageBody();

                // ส่ง Event ไปที่ React Native
                String fullMsg = "From: " + sender + "\nMsg: " + body;
                
                if (reactContext.hasActiveCatalystInstance()) {
                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onSMSReceived", fullMsg);
                }
            }
        }
    }
}