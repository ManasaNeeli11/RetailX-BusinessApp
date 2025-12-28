// screens/AlertsScreen.js - DUE DATE + LIMIT ALERTS
import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const AlertsScreen = () => {
  const dispatch = useDispatch();
  const { customers, reminders } = useSelector(state => state.app);

  // 🚨 Calculate ALL alerts automatically
  const alerts = [
    // 1. OVERDUE INVOICES (Past due date)
    ...customers.flatMap(customer => 
      customer.pending?.map((pending, idx) => {
        const dueDate = new Date(pending.dueDate);
        const isOverdue = dueDate < new Date();
        return isOverdue ? [{
          id: `overdue-${customer.name}-${idx}`,
          type: 'overdue',
          title: `${customer.name}`,
          message: `₹${pending.amount?.toFixed(0) || 0} overdue since ${pending.dueDate}`,
          severity: 'high',
          date: pending.dueDate,
          customer: customer.name,
          amount: pending.amount,
        }] : [];
      }).flat()
    ),
    
    // 2. LIMIT EXCEEDED customers
    ...customers
      .filter(customer => {
        const totalPending = customer.pending?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        return totalPending > (customer.allowedLimit || 10000);
      })
      .map(customer => {
        const totalPending = customer.pending.reduce((sum, p) => sum + (p.amount || 0), 0);
        return {
          id: `limit-${customer.name}`,
          type: 'limit',
          title: `${customer.name}`,
          message: `Limit exceeded! ₹${totalPending.toFixed(0)} / ₹${customer.allowedLimit}`,
          severity: 'critical',
          customer: customer.name,
          amount: totalPending - customer.allowedLimit,
        };
      }),

    // 3. Manual reminders
    ...(reminders || []).map((reminder, idx) => ({
      id: `reminder-${idx}`,
      type: 'reminder',
      title: reminder.title || 'Reminder',
      message: reminder.message || '',
      severity: reminder.severity || 'normal',
      date: reminder.dueDate,
    })),
  ];

  // Clear old reminders
  useEffect(() => {
    dispatch({ type: 'CLEAR_REMINDERS' });
  }, [dispatch]);

  const clearAlerts = () => {
    Alert.alert(
      'Clear All Alerts?',
      `This will dismiss ${alerts.length} alerts`,
      [
        { text: 'Cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => dispatch({ type: 'CLEAR_REMINDERS' }) }
      ]
    );
  };

  const renderAlert = ({ item }) => (
    <TouchableOpacity style={[
      styles.alertItem,
      styles[`severity${item.severity === 'critical' ? 'Critical' : 
              item.severity === 'high' ? 'High' : 'Normal'}`]
    ]}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <View style={[
          styles.badge,
          { backgroundColor: item.severity === 'critical' ? '#f44336' : 
                           item.severity === 'high' ? '#ff9800' : '#667eea' }
        ]}>
          <Text style={styles.badgeText}>{item.severity.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.alertMessage}>{item.message}</Text>
      {item.date && (
        <Text style={styles.alertDate}>
          {new Date(item.date).toLocaleDateString('en-IN')}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 Alerts & Reminders</Text>
      
      {/* Header with count */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
        </Text>
        {alerts.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearAlerts}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={alerts.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB - dateA;
        })}
        keyExtractor={item => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>No Alerts!</Text>
            <Text style={styles.emptyText}>All payments on time and within limits ✅</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 24, textAlign: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerText: { fontSize: 18, fontWeight: '700', color: '#667eea' },
  clearBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffebee',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#ffcdd2',
  },
  clearBtnText: { color: '#d32f2f', fontSize: 15, fontWeight: '700' },
  list: { paddingBottom: 20 },
  alertItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  severityCritical: { borderLeftWidth: 5, borderLeftColor: '#f44336' },
  severityHigh: { borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  severityNormal: { borderLeftWidth: 3, borderLeftColor: '#667eea' },
  alertHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  alertTitle: { fontSize: 18, fontWeight: '800', color: '#333', flex: 1 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  alertMessage: { fontSize: 15, color: '#555', lineHeight: 22 },
  alertDate: { fontSize: 13, color: '#999', marginTop: 8, fontStyle: 'italic' },
  emptyContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60 
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#4CAF50', marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default AlertsScreen;
