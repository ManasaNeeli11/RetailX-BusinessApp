// screens/InvoiceScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const InvoiceScreen = () => {
  const dispatch = useDispatch();
  const stock = useSelector(state => state.app.stock);
  const invoices = useSelector(state => state.app.invoices);
  const shop = useSelector(state => state.app.shop) || { name: 'My Shop' };

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [items, setItems] = useState([]);
  const [dueDate, setDueDate] = useState('');

  const [itemForm, setItemForm] = useState({
    itemName: '',
    hsn: '',
    quantity: 0,
    rate: 0,
    unit: '',
    discount: 0,
    sgst: 0,
    cgst: 0,
  });
  const [suggestions, setSuggestions] = useState([]);

  // Auto-generate invoice number
  useEffect(() => {
    setInvoiceNumber(`INV-${(invoices.length + 1).toString().padStart(3, '0')}`);
  }, [invoices]);

  // Live totals: subtotal, discount, tax, grand total
  const totals = useMemo(() => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach(it => {
      const base = it.quantity * it.rate;
      const discAmount = base * (it.discount / 100);
      const taxable = base - discAmount;
      const taxAmount = taxable * ((it.sgst + it.cgst) / 100);

      subTotal += base;
      totalDiscount += discAmount;
      totalTax += taxAmount;
    });

    const grandTotal = subTotal - totalDiscount + totalTax;

    return {
      subTotal,
      totalDiscount,
      totalTax,
      grandTotal,
    };
  }, [items]);

  const handleItemNameChange = text => {
    setItemForm({ ...itemForm, itemName: text });
    if (text.trim()) {
      const filtered = stock
        .filter(s => s.itemName.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = s => {
    setItemForm({
      ...itemForm,
      itemName: s.itemName,
      hsn: s.hsn,
      rate: s.rate,
      unit: s.unit,
    });
    setSuggestions([]);
  };

  const addItem = () => {
    if (!itemForm.itemName || itemForm.quantity <= 0 || itemForm.rate <= 0) {
      return;
    }

    setItems(prev => [...prev, { ...itemForm }]);

    setItemForm({
      itemName: '',
      hsn: '',
      quantity: 0,
      rate: 0,
      unit: '',
      discount: 0,
      sgst: 0,
      cgst: 0,
    });
    setSuggestions([]);
  };

  const removeItem = index => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const createInvoice = () => {
    if (!customer.name.trim() || items.length === 0) {
      return;
    }

    dispatch({
      type: 'CREATE_INVOICE',
      payload: {
        invoiceNumber,
        customer,
        items,
        total: parseFloat(totals.grandTotal.toFixed(2)),
        dueDate: dueDate.trim() || 'Cash',
        date: new Date().toISOString().split('T')[0],
      },
    });

    // Reset form
    setItems([]);
    setCustomer({ name: '', phone: '' });
    setDueDate('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.title}>Create Invoice</Text>
          <Text style={styles.shopName}>{shop.name || 'My Shop'}</Text>
          <Text style={styles.invoiceNumber}>Invoice No: {invoiceNumber}</Text>

          {/* Customer details */}
          <Text style={styles.sectionLabel}>Customer details</Text>
          <TextInput
            placeholder="Customer Name"
            value={customer.name}
            onChangeText={t => setCustomer({ ...customer, name: t })}
            style={styles.input}
          />
          <TextInput
            placeholder="Customer Phone"
            value={customer.phone}
            onChangeText={t => setCustomer({ ...customer, phone: t })}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <TextInput
            placeholder="Due Date (YYYY-MM-DD) or leave blank for Cash"
            value={dueDate}
            onChangeText={setDueDate}
            style={styles.input}
          />

          {/* Add item section */}
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
              onChangeText={t => setItemForm({ ...itemForm, hsn: t })}
              style={[styles.input, styles.half]}
            />
            <TextInput
              placeholder="Qty"
              value={itemForm.quantity ? itemForm.quantity.toString() : ''}
              onChangeText={t =>
                setItemForm({
                  ...itemForm,
                  quantity: parseFloat(t) || 0,
                })
              }
              style={[styles.input, styles.half]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              placeholder="Rate"
              value={itemForm.rate ? itemForm.rate.toString() : ''}
              onChangeText={t =>
                setItemForm({
                  ...itemForm,
                  rate: parseFloat(t) || 0,
                })
              }
              style={[styles.input, styles.half]}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Unit (kg, pcs...)"
              value={itemForm.unit}
              onChangeText={t => setItemForm({ ...itemForm, unit: t })}
              style={[styles.input, styles.half]}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              placeholder="Discount %"
              value={itemForm.discount ? itemForm.discount.toString() : ''}
              onChangeText={t =>
                setItemForm({
                  ...itemForm,
                  discount: parseFloat(t) || 0,
                })
              }
              style={[styles.input, styles.third]}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="SGST %"
              value={itemForm.sgst ? itemForm.sgst.toString() : ''}
              onChangeText={t =>
                setItemForm({
                  ...itemForm,
                  sgst: parseFloat(t) || 0,
                })
              }
              style={[styles.input, styles.third]}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="CGST %"
              value={itemForm.cgst ? itemForm.cgst.toString() : ''}
              onChangeText={t =>
                setItemForm({
                  ...itemForm,
                  cgst: parseFloat(t) || 0,
                })
              }
              style={[styles.input, styles.third]}
              keyboardType="numeric"
            />
          </View>

          <Button title="Add item to invoice" onPress={addItem} color="#6200EE" />

          {/* Current items */}
          <Text style={styles.sectionTitle}>
            Items in invoice ({items.length})
          </Text>

          <FlatList
            data={items}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => {
              const base = item.quantity * item.rate;
              const discAmount = base * (item.discount / 100);
              const taxable = base - discAmount;
              const taxAmount = taxable * ((item.sgst + item.cgst) / 100);
              const lineTotal = taxable + taxAmount;

              return (
                <View style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} × ₹{item.rate} ({item.unit})
                    </Text>
                    <Text style={styles.itemDetails}>
                      Disc: {item.discount}% • SGST: {item.sgst}% • CGST:{' '}
                      {item.cgst}%
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemTotal}>₹{lineTotal.toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            style={{ flexGrow: 0 }}
          />

          {/* Totals card */}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sub total</Text>
              <Text style={styles.totalValue}>
                ₹{totals.subTotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>
                −₹{totals.totalDiscount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (SGST + CGST)</Text>
              <Text style={styles.totalValue}>
                +₹{totals.totalTax.toFixed(2)}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.totalRow}>
              <Text style={styles.grandLabel}>Grand total</Text>
              <Text style={styles.grandValue}>
                ₹{totals.grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          <Button title="Create Invoice" onPress={createInvoice} color="#4CAF50" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200EE',
    textAlign: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  invoiceNumber: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
    marginTop: 22,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  third: {
    width: '32%',
  },
  suggestions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    maxHeight: 200,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  itemName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  removeText: {
    marginTop: 4,
    fontSize: 13,
    color: '#d32f2f',
  },
  totalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 15,
    color: '#555',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  grandLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
});

export default InvoiceScreen;
