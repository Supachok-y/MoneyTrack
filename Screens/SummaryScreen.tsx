import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager , AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../store/useTransactionStore';
import { Transaction } from '../types/transaction';

// เปิดใช้งาน LayoutAnimation สำหรับ Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SummaryScreen = () => {
  // ดึง expandedId และ toggleExpand มาจาก Store
  const { selectedDate, setSelectedDate, getStatsByDate, expandedId, toggleExpand } = useTransactionStore();
  const { list, totalIncome, totalExpense, countIncome, countExpense } = getStatsByDate();

  const getTodayThaiDate = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear() + 543).slice(-2);
  return `${d}/${m}/${y}`;
};

  useEffect(() => {
  const subscription = AppState.addEventListener('change', nextAppState => {
    // เมื่อแอปกลับมาอยู่ที่หน้าจอ (active)
    if (nextAppState === 'active') {
      const today = getTodayThaiDate(); // ฟังก์ชันที่เราสร้างไว้
      if (selectedDate !== today) {
        setSelectedDate(today); // อัปเดตวันที่ให้เป็นปัจจุบันทันที
      }
    }
  });

  return () => subscription.remove();
}, [selectedDate]);

  const changeDate = (offset: number) => {
    const [d, m, y] = selectedDate.split('/').map(Number);
    const fullYear = 2500 + y - 543;
    const dateObj = new Date(fullYear, m - 1, d);
    dateObj.setDate(dateObj.getDate() + offset);

    const newD = String(dateObj.getDate()).padStart(2, '0');
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newY = String(dateObj.getFullYear() + 543).slice(-2);
    
    setSelectedDate(`${newD}/${newM}/${newY}`);
  };

  const handlePress = (id: string) => {
    // ใส่ Animation เพื่อให้ข้อความเลื่อนลงมานุ่มนวล
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleExpand(id); // เรียกฟังก์ชันสลับสถานะเปิด/ปิด
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === 'INCOME';
    const isExpanded = expandedId === item.id; // เช็คว่ารายการนี้กำลังถูกเปิดอยู่หรือไม่
    
    return (
      <View style={[
        styles.card, 
        { backgroundColor: isIncome ? '#F0FFF4' : '#FFF5F5' } 
      ]}>
        {/* ใช้ TouchableOpacity ครอบเพื่อให้กดได้ทั้งการ์ด */}
        <TouchableOpacity onPress={() => handlePress(item.id)} activeOpacity={0.7}>
          <View style={styles.cardRow}>
            <Text style={styles.textTime}>{item.time}</Text>
            <Text style={[
              styles.textAmount, 
              { color: isIncome ? '#2E7D32' : '#D32F2F' }
            ]}>
              {isIncome ? '+' : '-'}{item.amount.toLocaleString()}
            </Text>
          </View>

          {/* ส่วนแสดงข้อความจริง (จะแสดงเมื่อถูกกดเท่านั้น) */}
          {isExpanded && (
            <View style={styles.detailContainer}>
              <View style={styles.divider} />
              <Text style={styles.textOriginalLabel}>ข้อความต้นฉบับ:</Text>
              <Text style={styles.textRawMessage}>{item.rawMessage}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
  card: { borderRadius: 15, marginHorizontal: 15, marginVertical: 5, padding: 20, elevation: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textTime: { fontSize: 22, color: '#757575' },
  textAmount: { fontSize: 28, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 100, fontSize: 24, color: '#999' },
  
  // Style เพิ่มเติมสำหรับส่วนรายละเอียด
  detailContainer: { marginTop: 15 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 10 },
  textOriginalLabel: { fontSize: 14, color: '#888', marginBottom: 4 },
  textRawMessage: { fontSize: 16, color: '#444', lineHeight: 22 }
});

export default SummaryScreen;