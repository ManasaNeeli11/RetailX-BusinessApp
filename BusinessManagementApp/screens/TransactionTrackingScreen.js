// screens/TransactionTrackingScreen.js - WEB + MOBILE PERFECT
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Sharing from 'expo-sharing';

const TransactionTrackingScreen = () => {
  const dispatch = useDispatch();
  const transactions = useSelector(state => state.app.transactions);
  const [newTrans, setNewTrans] = useState({ type: 'cash', amount: '', details: '' });

  const summary = useMemo(() => {
    const cashTotal = transactions.cash.reduce((sum, t) => sum + (t.amount || 0), 0);
    const onlineTotal = transactions.online.reduce((sum, t) => sum + (t.amount || 0), 0);
    const grand = cashTotal + onlineTotal;
    return { cashTotal, onlineTotal, grand };
  }, [transactions]);

  const addTransaction = () => {
    const amountNum = parseFloat(newTrans.amount);
    if (!newTrans.details.trim() || !amountNum || amountNum <= 0) {
      Alert.alert('Error', 'Please enter valid amount and details');
      return;
    }

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        type: newTrans.type === 'online' ? 'online' : 'cash',
        amount: amountNum,
        details: newTrans.details.trim(),
        date: new Date().toISOString(),
      },
    });

    setNewTrans({ type: newTrans.type, amount: '', details: '' });
  };

  // ✅ WEB + MOBILE PERFECT CSV EXPORT
  const exportReports = async () => {
    try {
      // Create CSV content
      const csvRows = ['Type,Amount,Details,Date'];
      transactions.cash.forEach(t =>
        csvRows.push(`cash,${t.amount},"${(t.details || '').replace(/"/g, '""')}",${t.date || ''}`),
      );
      transactions.online.forEach(t =>
        csvRows.push(`online,${t.amount},"${(t.details || '').replace(/"/g, '""')}",${t.date || ''}`),
      );
      const csvContent = csvRows.join('\n');

      // ✅ WEB: Direct download
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('✅ Success', 'CSV downloaded!');
        return;
      }

      // ✅ MOBILE: FileSystem + Sharing
      const { FileSystem } = await import('expo-file-system');
      const fileName = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Share Transactions Report',
        });
        Alert.alert('✅ Success', 'CSV exported!');
      } else {
        Alert.alert('📋 Copy CSV', 'Copy CSV content to clipboard');
      }
    } catch (error) {
      console.log('Export error:', error);
      Alert.alert('❌ Error', `Export failed: ${error.message}`);
    }
  };

  const renderTransItem = ({ item }) => (
    <View style={styles.transItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.transAmount}>₹{item.amount?.toFixed(2) || 0}</Text>
        <Text style={styles.transDetails} numberOfLines={1}>
          {item.details || 'No details'}
        </Text>
      </View>
      <Text style={styles.transDate}>
        {item.date ? new Date(item.date).toLocaleDateString() : 'No date'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Transaction Tracking</Text>

      <TouchableOpacity style={styles.summaryCard} activeOpacity={0.9}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>💵 Cash</Text>
          <Text style={styles.summaryValue}>₹{summary.cashTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>💳 Online</Text>
          <Text style={styles.summaryValue}>₹{summary.onlineTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryGrand}>💎 Grand Total</Text>
          <Text style={styles.summaryGrandValue}>₹{summary.grand.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>💵 Cash ({transactions.cash.length})</Text>
      <FlatList
        data={transactions.cash}
        keyExtractor={(_, idx) => `cash-${idx}`}
        renderItem={renderTransItem}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No cash transactions</Text>}
      />

      <Text style={styles.sectionTitle}>💳 Online ({transactions.online.length})</Text>
      <FlatList
        data={transactions.online}
        keyExtractor={(_, idx) => `online-${idx}`}
        renderItem={renderTransItem}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No online transactions</Text>}
      />

      <Text style={styles.sectionTitle}>➕ Add Transaction</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeChip,
            newTrans.type === 'cash' && styles.typeChipActive,
          ]}
          onPress={() => setNewTrans({ ...newTrans, type: 'cash' })}
        >
          <Text style={[
            styles.typeChipText,
            newTrans.type === 'cash' && styles.typeChipTextActive,
          ]}>
            💵 Cash
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeChip,
            newTrans.type === 'online' && styles.typeChipActive,
          ]}
          onPress={() => setNewTrans({ ...newTrans, type: 'online' })}
        >
          <Text style={[
            styles.typeChipText,
            newTrans.type === 'online' && styles.typeChipTextActive,
          ]}>
            💳 Online
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Amount (₹)"
        value={newTrans.amount}
        onChangeText={text => setNewTrans({ ...newTrans, amount: text })}
        style={styles.input}
        keyboardType="decimal-pad"
      />
      <TextInput
        placeholder="Details (UPI ID, bill ref, etc.)"
        value={newTrans.details}
        onChangeText={text => setNewTrans({ ...newTrans, details: text })}
        style={styles.input}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addTransaction}>
        <Text style={styles.addBtnText}>➕ Add Transaction</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportBtn} onPress={exportReports}>
        <Text style={styles.exportBtnText}>📊 Export CSV ({transactions.cash.length + transactions.online.length} txns)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#667eea', marginBottom: 20, textAlign: 'center' },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#333' },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  summaryGrand: { fontSize: 18, fontWeight: '800', color: '#333' },
  summaryGrandValue: { fontSize: 22, fontWeight: '800', color: '#667eea' },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  list: { flex: 1 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', padding: 20, fontStyle: 'italic' },
  transItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  transAmount: { fontSize: 18, fontWeight: 'bold', color: '#667eea' },
  transDetails: { fontSize: 14, color: '#666', marginTop: 2 },
  transDate: { fontSize: 13, color: '#999' },
  typeRow: { flexDirection: 'row', marginBottom: 16 },
  typeChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#ddd',
    marginRight: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeChipText: { fontSize: 15, color: '#666', fontWeight: '600' },
  typeChipTextActive: { color: '#fff', fontWeight: '700' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  exportBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  exportBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TransactionTrackingScreen;
