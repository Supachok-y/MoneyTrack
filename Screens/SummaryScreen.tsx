import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../store/useTransactionStore';
import { Transaction } from '../types/transaction';

const SummaryScreen = () => {
  const { selectedDate, setSelectedDate, getStatsByDate } = useTransactionStore();
  const { list, totalIncome, totalExpense, countIncome, countExpense } = getStatsByDate();

  // ฟังก์ชันคำนวณเลื่อนวัน (จาก DD/MM/YY)
  const changeDate = (offset: number) => {
    const [d, m, y] = selectedDate.split('/').map(Number);
    const fullYear = 2500 + y - 543; // แปลงพุทธศักราชเป็นคริสต์ศักราชเบื้องต้นเพื่อคำนวณ
    const dateObj = new Date(fullYear, m - 1, d);
    
    dateObj.setDate(dateObj.getDate() + offset);

    const newD = String(dateObj.getDate()).padStart(2, '0');
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newY = String(dateObj.getFullYear() + 543).slice(-2); // กลับเป็นปีไทย 2 หลัก
    
    setSelectedDate(`${newD}/${newM}/${newY}`);
  };

const renderItem = ({ item }: { item: Transaction }) => {
  const isIncome = item.type === 'INCOME';
  
  return (
    <View style={[
      styles.card, 
      // เพิ่ม Logic เปลี่ยนสีพื้นหลังตรงนี้
      { backgroundColor: isIncome ? '#F0FFF4' : '#FFF5F5' } 
    ]}>
      <View style={styles.cardRow}>
        <Text style={styles.textTime}>{item.time}</Text>
        <Text style={[
          styles.textAmount, 
          { color: isIncome ? '#2E7D32' : '#D32F2F' }
        ]}>
          {isIncome ? '+' : '-'}{item.amount.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      {/* ส่วนเลือกวันที่: มีปุ่มกดง่ายๆ สำหรับผู้สูงอายุ */}
      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => changeDate(-1)}>
          <Text style={styles.dateBtnText}>{"<"}</Text>
        </TouchableOpacity>
        
        <View style={styles.dateDisplay}>
          <Text style={styles.textLabel}>รายการของวันที่</Text>
          <Text style={styles.textDate}>{selectedDate}</Text>
        </View>

        <TouchableOpacity style={styles.dateBtn} onPress={() => changeDate(1)}>
          <Text style={styles.dateBtnText}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* ส่วนสรุปผล (ตามโจทย์ข้อ 2 และ 4) */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryBox, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.summaryLabel, { color: '#2E7D32' }]}>เข้า ({countIncome} รอบ)</Text>
          <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>+{totalIncome.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.summaryLabel, { color: '#D32F2F' }]}>ออก ({countExpense} รอบ)</Text>
          <Text style={[styles.summaryValue, { color: '#D32F2F' }]}>-{totalExpense.toLocaleString()}</Text>
        </View>
      </View>

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีรายการ</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  datePickerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 4
  },
  dateBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, width: 60, alignItems: 'center' },
  dateBtnText: { color: '#FFF', fontSize: 30, fontWeight: 'bold' },
  dateDisplay: { alignItems: 'center' },
  textLabel: { fontSize: 18, color: '#666' },
  textDate: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  
  summaryContainer: { flexDirection: 'row', padding: 10 },
  summaryBox: { flex: 1, margin: 5, padding: 15, borderRadius: 12, alignItems: 'center' },
  summaryLabel: { fontSize: 18, fontWeight: 'bold' },
  summaryValue: { fontSize: 26, fontWeight: 'bold' },

  card: { borderRadius: 15, marginHorizontal: 15, marginVertical: 5, padding: 20,elevation: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  textTime: { fontSize: 22, color: '#757575' },
  textAmount: { fontSize: 28, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 100, fontSize: 24, color: '#999' }
});

export default SummaryScreen;