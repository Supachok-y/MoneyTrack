import React, { useEffect , useMemo } from 'react';
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
  const { selectedDate, setSelectedDate, getStatsByDate, expandedId, toggleExpand , transactions , refreshTrigger } = useTransactionStore();
  // 1. ตรวจสอบว่ามี transactions อยู่ใน useMemo Dependency หรือยัง
  const { list, totalIncome, totalExpense, countIncome, countExpense } = useMemo(
  () => getStatsByDate(),
  [selectedDate, transactions, refreshTrigger] // ถูกต้องแล้ว: เมื่อ transactions เปลี่ยน list จะเปลี่ยนตาม
);

// 2. ปรับปรุง useEffect ให้ทำงานแน่นอน 100%
useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        const today = getTodayThaiDate();
        // เรียก setSelectedDate เพื่อสะกิด refreshTrigger
        setSelectedDate(today); 
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
    });
    return () => subscription.remove();
  }, []);

  const getTodayThaiDate = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear() + 543).slice(-2);
  return `${d}/${m}/${y}`;
};

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
        { backgroundColor: isIncome ? '#F0FFF4' : '#FFF5F5' , borderColor: isIncome ? '#81C784' : '#EF9A9A' } 
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
        <View style={[styles.summaryBox, { backgroundColor: '#E8F5E9' , borderColor: '#2E7D32'   }]}>
          <Text style={[styles.summaryLabel, { color: '#2E7D32' }]}>เข้า ({countIncome} รอบ)</Text>
          <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>+{totalIncome.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: '#FFEBEE' , borderColor: '#C62828' }]}>
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
  container: { 
    flex: 1, 
    backgroundColor: '#E0E0E0'  // ขาวสะอาด ไม่เทา
  },
  datePickerContainer: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  backgroundColor: '#1565C0',
  paddingVertical: 20,
  paddingHorizontal: 16,
  elevation: 6
  },
  dateBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)', // กระจกใสบนน้ำเงิน 
    borderRadius: 28,        // ✅ กลมสมบูรณ์
    padding: 16, 
    width: 70,        // ปุ่มกว้างขึ้น 
    height: 70,       // ปุ่มสูงขึ้น กดง่าย
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.8)',  // ขอบขาวบางๆ
    elevation: 2
  },
  dateBtnText: { 
    color: '#FFFFFF',
    fontSize: 28,      // ใหญ่ขึ้น
    fontWeight: 'bold',
    lineHeight: 32, 
  },
  dateDisplay: { alignItems: 'center' },
  textLabel: { 
    fontSize: 20,      // ใหญ่ขึ้น
    color: '#FFFFFF',  // ขาว ตัดกับพื้นน้ำเงิน
    fontWeight: '600'
  },
  textDate: { 
    fontSize: 42,      // ใหญ่มาก อ่านง่าย
    fontWeight: 'bold', 
    color: '#FFFFFF'   // ขาว
  },
  summaryContainer: { 
    flexDirection: 'row', 
    padding: 12,
    backgroundColor: '#E0E0E0'
  },
  summaryBox: { 
    flex: 1, 
    margin: 6, 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    elevation: 3,
    borderWidth: 2,    // มี border ชัดเจน
  },
  summaryLabel: { 
    fontSize: 16,      // ใหญ่ขึ้น
    fontWeight: 'bold',
    marginBottom: 6
  },
  summaryValue: { 
    fontSize: 34,      // ใหญ่มาก
    fontWeight: 'bold' 
  },
  card: { 
    borderRadius: 16, 
    marginHorizontal: 12, 
    marginVertical: 6, 
    padding: 22, 
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,  // มี border ช่วยให้เห็นขอบการ์ดชัด
  },
  cardRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  textTime: { 
    fontSize: 26,      // ใหญ่ขึ้น
    color: '#424242',  // เทาเข้ม อ่านง่าย
    fontWeight: '500'
  },
  textAmount: { 
    fontSize: 34,      // ใหญ่มาก เห็นตัวเลขชัด
    fontWeight: 'bold' 
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 100, 
    fontSize: 26, 
    color: '#757575' 
  },
  detailContainer: { marginTop: 15 },
  divider: { 
    height: 2,         // หนาขึ้น
    backgroundColor: 'rgba(0,0,0,0.1)', 
    marginBottom: 12 
  },
  textOriginalLabel: { 
    fontSize: 18,      // ใหญ่ขึ้น
    color: '#666', 
    marginBottom: 6,
    fontWeight: '600'
  },
  textRawMessage: { 
    fontSize: 18,      // ใหญ่ขึ้น
    color: '#333',     // เกือบดำ อ่านง่าย
    lineHeight: 28     // ระยะบรรทัดกว้างขึ้น
  }
});

export default SummaryScreen;