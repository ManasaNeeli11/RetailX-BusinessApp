import React from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const generateInvoiceHTML = (shop, invoice) => {
  const itemsTable = invoice.items.map(item => `
    <tr>
      <td style="padding:8px;">${item.itemName}</td>
      <td style="padding:8px;">${item.hsn}</td>
      <td style="padding:8px;">${item.quantity}</td>
      <td style="padding:8px;">₹${item.rate}</td>
      <td style="padding:8px;">${item.unit}</td>
      <td style="padding:8px;">${item.discount}%</td>
      <td style="padding:8px;">${item.sgst}%</td>
      <td style="padding:8px;">${item.cgst}%</td>
    </tr>
  `).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center; color: #6200EE;">${shop.name || 'My Shop'}</h1>
        <p style="text-align: center;">${shop.address || ''}</p>
        <p style="text-align: center;">Phone: ${shop.phone || ''} | GST: ${shop.gst || ''}</p>
        <hr>
        <h2 style="text-align: center;">Invoice ${invoice.invoiceNumber}</h2>
        <p><strong>Customer:</strong> ${invoice.customer.name} - ${invoice.customer.phone}</p>
        <p><strong>Date:</strong> ${invoice.date || ''} | <strong>Due Date:</strong> ${invoice.dueDate || 'Cash'}</p>
        <table style="width:100%; border-collapse: collapse; margin:20px 0;">
          <thead style="background:#6200EE; color:white;">
            <tr>
              <th style="padding:10px; text-align:left;">Item</th>
              <th style="padding:10px;">HSN</th>
              <th style="padding:10px;">Qty</th>
              <th style="padding:10px;">Rate</th>
              <th style="padding:10px;">Unit</th>
              <th style="padding:10px;">Disc%</th>
              <th style="padding:10px;">SGST%</th>
              <th style="padding:10px;">CGST%</th>
            </tr>
          </thead>
          <tbody>${itemsTable}</tbody>
        </table>
        <h2 style="text-align: right; color:#6200EE;">Total: ₹${invoice.total}</h2>
        <p style="text-align: center; margin-top:50px; color:#666;">Thank you for your business!</p>
      </body>
    </html>
  `;
};

const CustomerPendingScreen = () => {
  const customers = useSelector(state => state.app.customers);
  const shop = useSelector(state => state.app.shop) || { name: 'My Shop' };

  const shareBill = async (invoice) => {
    const html = generateInvoiceHTML(shop, invoice);
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Invoice' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Pending Payments</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.name + item.phone}
        renderItem={({ item }) => {
          const pendingAmount = item.pending.reduce((sum, p) => sum + p.amount, 0);

          return (
            <View style={styles.customerCard}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.customerPhone}>📞 {item.phone}</Text>
              <Text style={styles.pendingAmount}>Pending: ₹{pendingAmount.toFixed(2)}</Text>

              <Text style={styles.historyTitle}>Invoice History</Text>
              <FlatList
                data={item.history}
                keyExtractor={(hist) => hist.invoiceNumber}
                renderItem={({ item: hist }) => (
                  <View style={styles.historyItem}>
                    <View>
                      <Text style={styles.invoiceNumber}>Invoice {hist.invoiceNumber}</Text>
                      <Text style={styles.invoiceTotal}>₹{hist.total} • {hist.date || 'Today'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => shareBill(hist)}>
                      <Text style={styles.shareButton}>Share PDF</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#6200EE', marginBottom: 25, textAlign: 'center' },
  customerCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  customerName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  customerPhone: { fontSize: 18, color: '#666', marginBottom: 10 },
  pendingAmount: { fontSize: 24, fontWeight: 'bold', color: '#d32f2f', marginBottom: 15 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#6200EE', marginTop: 10, marginBottom: 10 },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  invoiceNumber: { fontSize: 16, fontWeight: '600' },
  invoiceTotal: { fontSize: 16, color: '#6200EE', fontWeight: 'bold' },
  shareButton: { color: '#6200EE', fontWeight: 'bold', fontSize: 16 },
});

export default CustomerPendingScreen;