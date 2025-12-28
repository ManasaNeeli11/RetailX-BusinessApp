// screens/QuotationScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const generateQuotationHTML = (shop, quotation) => {
  const rows = quotation.items
    .map(
      item => `
      <tr>
        <td>${item.itemName}</td>
        <td>${item.hsn}</td>
        <td>${item.quantity}</td>
        <td>${item.rate}</td>
        <td>${item.unit}</td>
        <td>${item.discount}%</td>
      </tr>`,
    )
    .join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding:16px;">
        <h1 style="text-align:center;color:#6200EE;">${shop.name}</h1>
        <p style="text-align:center;">${shop.address}</p>
        <p style="text-align:center;">Phone: ${shop.phone} | GST: ${shop.gst}</p>
        <hr/>
        <h2>Quotation</h2>
        <p><strong>Customer:</strong> ${quotation.customer.name} - ${quotation.customer.phone}</p>
        <table border="1" cellspacing="0" cellpadding="6" style="width:100%;border-collapse:collapse;margin-top:10px;">
          <thead style="background:#f0f0f0;">
            <tr>
              <th>Item</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Unit</th>
              <th>Discount%</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <h3 style="text-align:right;margin-top:16px;">Total: ₹${quotation.total}</h3>
      </body>
    </html>
  `;
};

const QuotationScreen = () => {
  const dispatch = useDispatch();
  const stock = useSelector(state => state.app.stock);
  const shop = useSelector(state => state.app.shop) || {};
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({
    itemName: '',
    hsn: '',
    quantity: '',
    rate: '',
    unit: '',
    discount: '',
  });
  const [suggestions, setSuggestions] = useState([]);

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const qty = it.quantity || 0;
      const rate = it.rate || 0;
      const disc = it.discount || 0;
      const base = qty * rate;
      const discAmount = base * (disc / 100);
      return sum + (base - discAmount);
    }, 0);
  }, [items]);

  const handleItemNameChange = text => {
    setItemForm({ ...itemForm, itemName: text });
    if (text.trim()) {
      setSuggestions(
        stock
          .filter(s => s.itemName.toLowerCase().includes(text.toLowerCase()))
          .slice(0, 8),
      );
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = s => {
    setItemForm({
      ...itemForm,
      itemName: s.itemName,
      hsn: s.hsn,
      rate: String(s.rate),
      unit: s.unit,
    });
    setSuggestions([]);
  };

  const addItem = () => {
    const qty = parseFloat(itemForm.quantity);
    const rate = parseFloat(itemForm.rate);
    const disc = parseFloat(itemForm.discount) || 0;

    if (!itemForm.itemName || !qty || qty <= 0 || !rate || rate <= 0) return;

    setItems(prev => [
      ...prev,
      {
        itemName: itemForm.itemName,
        hsn: itemForm.hsn,
        quantity: qty,
        rate,
        unit: itemForm.unit,
        discount: disc,
      },
    ]);

    setItemForm({
      itemName: '',
      hsn: '',
      quantity: '',
      rate: '',
      unit: '',
      discount: '',
    });
    setSuggestions([]);
  };

  const createQuotation = () => {
    if (!customer.name.trim() || items.length === 0) return;

    dispatch({
      type: 'CREATE_QUOTATION',
      payload: { customer, items, total: parseFloat(total.toFixed(2)) },
    });

    setItems([]);
    setCustomer({ name: '', phone: '' });
  };

  const shareQuotation = async () => {
    if (!customer.name.trim() || items.length === 0) return;
    const html = generateQuotationHTML(shop, {
      customer,
      items,
      total: total.toFixed(2),
    });
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Quotation PDF',
    });
  };

  const renderItem = ({ item }) => {
    const base = item.quantity * item.rate;
    const disc = base * ((item.discount || 0) / 100);
    const lineTotal = base - disc;
    return (
      <View style={styles.itemCard}>
        <View>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <Text style={styles.itemDetails}>
            {item.quantity} × ₹{item.rate} ({item.unit}) • Disc {item.discount}%
          </Text>
        </View>
        <Text style={styles.itemTotal}>₹{lineTotal.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Quotation (No Tax)</Text>

        <TextInput
          placeholder="Customer Name"
          value={customer.name}
          onChangeText={text => setCustomer({ ...customer, name: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone"
          value={customer.phone}
          onChangeText={text => setCustomer({ ...customer, phone: text })}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionTitle}>Add item</Text>

        <TextInput
          placeholder="Item Name (type to search stock)"
          value={itemForm.itemName}
          onChangeText={handleItemNameChange}
          style={styles.input}
        />

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map(s => (
              <TouchableOpacity
                key={s.itemName}
                onPress={() => selectSuggestion(s)}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>
                  {s.itemName} • Stock: {s.quantity} {s.unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.row}>
          <TextInput
            placeholder="HSN"
            value={itemForm.hsn}
            onChangeText={text => setItemForm({ ...itemForm, hsn: text })}
            style={[styles.input, styles.half]}
          />
          <TextInput
            placeholder="Quantity"
            value={itemForm.quantity}
            onChangeText={text => setItemForm({ ...itemForm, quantity: text })}
            style={[styles.input, styles.half]}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder="Rate"
            value={itemForm.rate}
            onChangeText={text => setItemForm({ ...itemForm, rate: text })}
            style={[styles.input, styles.half]}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Unit"
            value={itemForm.unit}
            onChangeText={text => setItemForm({ ...itemForm, unit: text })}
            style={[styles.input, styles.half]}
          />
        </View>

        <TextInput
          placeholder="Discount %"
          value={itemForm.discount}
          onChangeText={text => setItemForm({ ...itemForm, discount: text })}
          style={styles.input}
          keyboardType="numeric"
        />

        <Button title="Add Item" onPress={addItem} color="#6200EE" />

        <Text style={styles.sectionTitle}>Items</Text>
        <FlatList
          data={items}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
          style={{ flexGrow: 0 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items added yet.</Text>
          }
        />

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total (no tax)</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>

        <Button title="Create Quotation" onPress={createQuotation} color="#4CAF50" />
        <View style={{ height: 8 }} />
        <Button title="Share Quotation PDF" onPress={shareQuotation} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  suggestions: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: { fontSize: 14, color: '#333' },
  itemCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 3,
  },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemDetails: { fontSize: 13, color: '#666' },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#6200EE' },
  emptyText: { fontSize: 12, color: '#999' },
  totalCard: {
    marginVertical: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 3,
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#6200EE' },
});

export default QuotationScreen;
