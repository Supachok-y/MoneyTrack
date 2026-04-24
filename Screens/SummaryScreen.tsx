import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTransactionStore } from '../store/useTransactionStore';
import { Transaction } from '../types/transaction';

const MoneyTrackerScreen = () => {
  // ดึงข้อมูลและฟังก์ชันจาก Store
  const { selectedDate, getStatsByDate } = useTransactionStore();
  const { list, totalIncome, totalExpense, countIncome, countExpense } = getStatsByDate();

  // ฟังก์ชันสำหรับ Render แต่ละรายการ (ข้อ 3)
  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === 'INCOME';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.textTime}>{item.time}</Text>
          <Text style={[styles.textAmount, { color: isIncome ? '#2E7D32' : '#D32F2F' }]}>
            {isIncome ? '+' : '-'}{item.amount.toLocaleString()} บาท
          </Text>
        </View>
        <Text style={styles.textRaw} numberOfLines={1}>{item.rawMessage}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ส่วนหัว: เลือกวันที่ (ข้อ 1) */}
      <View style={styles.header}>
        <Text style={styles.textLabel}>วันที่ดูอยู่:</Text>
        <Text style={styles.textDate}>{selectedDate}</Text>
      </View>

      {/* ส่วนสรุปผล: เข้า/ออก และ จำนวนรอบ (ข้อ 2 & 4) */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryBox, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.summaryLabel, { color: '#2E7D32' }]}>เงินเข้า ({countIncome} รอบ)</Text>
          <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>
            +{totalIncome.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.summaryBox, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.summaryLabel, { color: '#D32F2F' }]}>เงินออก ({countExpense} รอบ)</Text>
          <Text style={[styles.summaryValue, { color: '#D32F2F' }]}>
            -{totalExpense.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* รายการของวันนั้น (ข้อ 3) */}
      <Text style={styles.sectionTitle}>รายการวันนี้</Text>
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>ไม่มีรายการของวันนี้</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFF', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#DDD' },
  textLabel: { fontSize: 20, color: '#666' },
  textDate: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  
  summaryContainer: { flexDirection: 'row', padding: 10, justifyContent: 'space-between' },
  summaryBox: { flex: 1, margin: 5, padding: 15, borderRadius: 12, alignItems: 'center', elevation: 3 },
  summaryLabel: { fontSize: 18, fontWeight: 'bold' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', marginTop: 5 },

  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 15, marginTop: 15, marginBottom: 10 },
  card: { backgroundColor: '#FFF', marginHorizontal: 15, marginVertical: 6, padding: 15, borderRadius: 10, elevation: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textTime: { fontSize: 20, color: '#757575' },
  textAmount: { fontSize: 28, fontWeight: 'bold' },
  textRaw: { fontSize: 16, color: '#9E9E9E', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 22, color: '#999' }
});

export default MoneyTrackerScreen;