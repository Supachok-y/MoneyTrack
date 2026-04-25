import React, { useEffect } from 'react';
import { 
  NativeModules, 
  NativeEventEmitter,  // ✅ เพิ่ม
  PermissionsAndroid, 
  Platform, 
  Alert, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import SummaryScreen from './Screens/SummaryScreen';
import { useTransactionStore } from './store/useTransactionStore';
import { parseSMS } from './utils/smsParser';
import { Transaction } from './types/transaction';

const { SMSModule } = NativeModules;
const smsEventEmitter = new NativeEventEmitter(SMSModule); // ✅ เพิ่ม

const App = () => {
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const processSingleSMS = (fullMsg: string) => {
    const cleanData: Transaction | null = parseSMS(fullMsg);
    if (cleanData) {
      addTransaction(cleanData);
    }
  };

  const fetchAndProcessSMS = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,  // ✅ เพิ่ม
        ]);

        if (granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED) {
          // โหลด SMS เก่าจาก inbox ก่อน
          const rawData: string = await SMSModule.getAllSMS();
          if (rawData) {
            rawData.split("[END_MSG]").forEach((fullMsg: string) => {
              if (fullMsg.trim() !== "") processSingleSMS(fullMsg);
            });
          }

          // ✅ เริ่ม Listener รับ SMS ใหม่แบบ Real-time
          await SMSModule.startSMSListener();
        } else {
          Alert.alert("คำเตือน", "ต้องอนุญาตให้อ่าน SMS เพื่อใช้งานแอปได้ครับ");
        }
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาด:", err);
    }
  };

  useEffect(() => {
    fetchAndProcessSMS();

    // ✅ Subscribe รับ Event เมื่อมี SMS เข้าแบบ Real-time
    const subscription = smsEventEmitter.addListener('onSMSReceived', (fullMsg: string) => {
      console.log('📩 SMS เข้าแบบ Real-time:', fullMsg);
      processSingleSMS(fullMsg);
    });

    return () => {
      // ✅ Cleanup เมื่อ Component unmount
      subscription.remove();
      SMSModule.stopSMSListener();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <SummaryScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
});

export default App;