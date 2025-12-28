import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const StockManagementScreen = () => {
  const dispatch = useDispatch();
  const stock = useSelector(state => state.app.stock);

  const [newStock, setNewStock] = useState({
    itemName: '', hsn: '', quantity: 0, rate: 0, unit: '', minLimit: 0, dealer: ''
  });

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const lowStock = stock.filter(s => s.quantity < s.minLimit);
    const grouped = lowStock.reduce((acc, item) => {
      let group = acc.find(g => g.dealer === item.dealer);
      if (!group) {
        group = { dealer: item.dealer, items: [] };
        acc.push(group);
      }
      group.items.push(item);
      return acc;
    }, []);
    setOrders(grouped);
  }, [stock]);

  const addStock = () => {
    if (!newStock.itemName || !newStock.dealer || newStock.quantity <= 0) return;

    dispatch({ type: 'ADD_STOCK', payload: { ...newStock } });
    setNewStock({ itemName: '', hsn: '', quantity: 0, rate: 0, unit: '', minLimit: 0, dealer: '' });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
        <View style={styles.container}>
          <Text style={styles.title}>Stock Management</Text>

          <Text style={styles.sectionTitle}>Add New Stock</Text>
          <TextInput placeholder="Item Name" value={newStock.itemName} onChangeText={t => setNewStock({ ...newStock, itemName: t })} style={styles.input} />
          <TextInput placeholder="HSN Code" value={newStock.hsn} onChangeText={t => setNewStock({ ...newStock, hsn: t })} style={styles.input} />
          <TextInput placeholder="Quantity" value={newStock.quantity.toString()} onChangeText={t => setNewStock({ ...newStock, quantity: parseInt(t) || 0 })} style={styles.input} keyboardType="numeric" />
          <TextInput placeholder="Rate" value={newStock.rate.toString()} onChangeText={t => setNewStock({ ...newStock, rate: parseFloat(t) || 0 })} style={styles.input} keyboardType="numeric" />
          <TextInput placeholder="Unit" value={newStock.unit} onChangeText={t => setNewStock({ ...newStock, unit: t })} style={styles.input} />
          <TextInput placeholder="Min Limit" value={newStock.minLimit.toString()} onChangeText={t => setNewStock({ ...newStock, minLimit: parseInt(t) || 0 })} style={styles.input} keyboardType="numeric" />
          <TextInput placeholder="Dealer Name" value={newStock.dealer} onChangeText={t => setNewStock({ ...newStock, dealer: t })} style={styles.input} />

          <Button title="Add Stock" onPress={addStock} color="#6200EE" />

          <Text style={styles.sectionTitle}>Current Stock</Text>
          <FlatList
            data={stock}
            keyExtractor={item => item.itemName}
            nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <View style={[styles.stockItem, item.quantity < item.minLimit && styles.lowStockItem]}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text>Quantity: {item.quantity} {item.unit}</Text>
                <Text>Min Limit: {item.minLimit} | Dealer: {item.dealer}</Text>
                {item.quantity < item.minLimit && <Text style={styles.warning}>⚠️ Low Stock!</Text>}
              </View>
            )}
          />

          {orders.length > 0 && (
            <>
              <Text style={styles.orderTitle}>Reorder List</Text>
              {orders.map(group => (
                <View key={group.dealer} style={styles.orderGroup}>
                  <Text style={styles.dealerName}>Dealer: {group.dealer}</Text>
                  {group.items.map(item => (
                    <Text key={item.itemName}>• {item.itemName} (Only {item.quantity} left)</Text>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#6200EE' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: '#f9f9f9' },
  stockItem: { padding: 15, backgroundColor: '#f5f5f5', borderRadius: 10, marginBottom: 10 },
  lowStockItem: { backgroundColor: '#ffebee' },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  warning: { color: 'red', fontWeight: 'bold', marginTop: 5 },
  orderTitle: { fontSize: 22, fontWeight: 'bold', color: 'red', marginTop: 30, marginBottom: 10 },
  orderGroup: { backgroundColor: '#fff3e0', padding: 15, borderRadius: 10, marginBottom: 15 },
  dealerName: { fontWeight: 'bold', fontSize: 18, color: '#d84315' },
});

export default StockManagementScreen;