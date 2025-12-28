// screens/DealerPaymentsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const DealerPaymentsScreen = () => {
  const dispatch = useDispatch();
  const dealers = useSelector(state => state.app.dealers);
  const [payment, setPayment] = useState({ dealer: '', amount: '' });

  // Clear invalid (zero amount) history on mount
  useEffect(() => {
    dispatch({ type: 'CLEAR_INVALID_DEALER_HISTORY' });
  }, [dispatch]);

  const payDealer = () => {
    const amountNum = parseFloat(payment.amount);
    
    // Strict validation
    if (!payment.dealer.trim()) {
      Alert.alert('Error', 'Please enter dealer name');
      return;
    }
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Error', 'Please enter valid amount (> 0)');
      return;
    }

    dispatch({
      type: 'PAY_DEALER',
      payload: {
        dealer: payment.dealer.trim(),
        amount: amountNum,
        date: new Date().toISOString(),
      },
    });

    // Reset form
    setPayment({ dealer: '', amount: '' });
    Alert.alert('Success', `₹${amountNum} paid to ${payment.dealer.trim()}`);
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>
        {item.date ? item.date.split('T')[0] : 'Today'}
      </Text>
      <Text style={styles.historyAmount}>₹{Number(item.amount).toFixed(2)}</Text>
      <Text style={styles.historyType}>{item.type}</Text>
      {item.itemName && (
        <Text style={styles.historyItemDetail}>
          {item.itemName} × {item.quantity}
        </Text>
      )}
    </View>
  );

  const renderDealer = ({ item }) => (
    <View style={styles.dealerCard}>
      <View style={styles.dealerHeader}>
        <Text style={styles.dealerName}>{item.name}</Text>
        <TouchableOpacity
          onPress={() => dispatch({ type: 'RESET_DEALER', payload: item.name })}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.dealerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Billed</Text>
          <Text style={styles.statValue}>₹{Number(item.billed || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Paid</Text>
          <Text style={styles.statValue}>₹{Number(item.paid || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>To Pay</Text>
          <Text style={[
            styles.statValue,
            (item.toPay || 0) > 0 ? styles.duePositive : styles.dueZero
          ]}>
            ₹{Number(item.toPay || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.historyTitle}>Payment History</Text>
      <FlatList
        data={item.history || []}
        keyExtractor={(_, idx) => `hist-${idx}`}
        renderItem={renderHistoryItem}
        style={styles.historyList}
        ListEmptyComponent={<Text style={styles.noHistory}>No payments recorded</Text>}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dealer Payments</Text>

      <FlatList
        data={dealers.filter(d => d.name)} // Filter out empty dealers
        keyExtractor={item => item.name}
        renderItem={renderDealer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No dealers added yet.</Text>
            <Text style={styles.emptySubtext}>
              Record your first payment below
            </Text>
          </View>
        }
      />

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Record Payment</Text>
        <TextInput
          placeholder="Dealer Name"
          value={payment.dealer}
          onChangeText={text => setPayment({ ...payment, dealer: text })}
          style={styles.input}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Amount (₹)"
          value={payment.amount}
          onChangeText={text => setNewAmount(text)}
          style={styles.input}
          keyboardType="decimal-pad"
        />
        <Button title="Record Payment" onPress={payDealer} color="#4CAF50" />
      </View>
    </View>
  );
};

// Helper to safely update amount as string
const setNewAmount = text => {
  // Only allow numbers, decimal point, and basic formatting
  const cleanText = text.replace(/[^0-9.]/g, '');
  setPayment(prev => ({ ...prev, amount: cleanText }));
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f8f9fa' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#6200EE', 
    marginBottom: 20,
    textAlign: 'center'
  },
  dealerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dealerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dealerName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#d32f2f',
    fontWeight: '600',
  },
  dealerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: { 
    fontSize: 12, 
    color: '#666', 
    marginBottom: 4 
  },
  statValue: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  duePositive: { color: '#d32f2f' },
  dueZero: { color: '#4CAF50' },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  historyList: { 
    flexGrow: 0,
    maxHeight: 120,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 4,
  },
  historyDate: { fontSize: 12, color: '#666' },
  historyAmount: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#4CAF50' 
  },
  historyType: { fontSize: 12, color: '#6200EE' },
  historyItemDetail: { 
    fontSize: 11, 
    color: '#999', 
    marginTop: 2 
  },
  noHistory: { 
    fontSize: 12, 
    color: '#999', 
    textAlign: 'center', 
    padding: 12 
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center',
    marginBottom: 8 
  },
  emptySubtext: { 
    fontSize: 14, 
    color: '#999', 
    textAlign: 'center' 
  },
});

export default DealerPaymentsScreen;
