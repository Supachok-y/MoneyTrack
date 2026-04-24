import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  NativeModules,
} from 'react-native';

// เรียกใช้ Module ที่เราเขียนเอง
const { SMSModule } = NativeModules;

const App = () => {
  const [latestSms, setLatestSms] = useState('ยังไม่ได้กดดึงข้อมูล');

  const requestSmsPermission = async () => {
    try {
      // ขั้นตอนสำคัญ: ต้องขออนุญาตก่อน ไม่งั้น Java จะพัง
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // เรียกใช้ฟังก์ชันที่เราเขียนใน Java
        const message = await SMSModule.getLatestSMS();
        setLatestSms(message);
      } else {
        Alert.alert('Permission Denied', 'คุณต้องอนุญาตให้แอปอ่าน SMS ก่อนครับ');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MoneyTrack SMS Test</Text>
      
      <View style={styles.smsBox}>
        <Text style={styles.smsText}>{latestSms}</Text>
      </View>

      <Button title="กดเพื่อดึง SMS ล่าสุด" onPress={requestSmsPermission} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  smsBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  smsText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
});

export default App;