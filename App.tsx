import React, { useEffect } from 'react';
import { 
  NativeModules, 
  PermissionsAndroid, 
  Platform, 
  Alert, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import SummaryScreen from './Screens/SummaryScreen'; // หน้าจอ UI หลัก
import { useTransactionStore } from './store/useTransactionStore';
import { parseSMS } from './utils/smsParser';
import { Transaction } from './types/transaction';

// ดึง Module ที่เราแก้ Java ให้ดึงแบบ getAllSMS มาแล้ว
const { SMSModule } = NativeModules;

const App = () => {
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  /**
   * ฟังก์ชันดึง SMS ทั้งหมดและนำมาคัดกรอง
   */
  const fetchAndProcessSMS = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // 1. ดึงข้อความทั้งหมด (ที่ใช้ [END_MSG] เป็นตัวคั่น)
          const rawData: string = await SMSModule.getAllSMS();
          
          if (rawData) {
            // 2. หั่นข้อความเป็น Array
            const messageArray: string[] = rawData.split("[END_MSG]");

            // 3. วนลูปเพื่อจัดการทีละข้อความ
            messageArray.forEach((fullMsg: string) => {
              if (fullMsg.trim() !== "") {
                const cleanData: Transaction | null = parseSMS(fullMsg);
                
                // 4. ถ้าผ่านด่าน KBank และเป็นธุรกรรม ให้เก็บลง Store
                if (cleanData) {
                  addTransaction(cleanData);
                }
              }
            });
          }
        } else {
          Alert.alert(
            "คำเตือน", 
            "คุณแม่ต้องกด 'อนุญาต' เพื่อให้แอปอ่านยอดเงินจาก SMS ได้นะครับ"
          );
        }
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
    }
  };

  // รันครั้งแรกเมื่อเปิดแอป
  useEffect(() => {
    fetchAndProcessSMS();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {/* แสดงหน้าจอหลักที่คุณสร้างไว้ */}
      <SummaryScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // พื้นหลังสีเทาอ่อน สบายตาคุณแม่
  },
});

export default App;