// screens/AiSmartInput.js - AI SMART SUGGESTIONS
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';

const AiSmartInput = ({ onSelectItem, style }) => {
  const stock = useSelector(state => state.app.stock);
  const shop = useSelector(state => state.app.shop);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // 🤖 AI SHOP-TYPE DATABASE
  const shopTypeItems = {
    'Hardware': [
      { name: 'Cement 50kg', hsn: '252329', rate: 350, unit: 'bag' },
      { name: 'Bricks', hsn: '690100', rate: 8, unit: 'pcs' },
      { name: 'Sand', hsn: '250510', rate: 1200, unit: 'ton' },
      { name: 'Steel TMT 12mm', hsn: '721420', rate: 65, unit: 'kg' },
      { name: 'Paint Asian 20L', hsn: '320890', rate: 4500, unit: 'bucket' },
    ],
    'Electronics': [
      { name: 'LED Bulb 9W', hsn: '853952', rate: 120, unit: 'pcs' },
      { name: 'Ceiling Fan 48"', hsn: '841451', rate: 1800, unit: 'pcs' },
      { name: 'Copper Wire 1.5sqmm', hsn: '741300', rate: 85, unit: 'meter' },
      { name: 'Modular Switch', hsn: '853650', rate: 45, unit: 'pcs' },
    ],
    'Grocery': [
      { name: 'Rice Basmati 5kg', hsn: '100630', rate: 650, unit: 'bag' },
      { name: 'Sunflower Oil 5L', hsn: '151219', rate: 580, unit: 'can' },
      { name: 'Wheat Flour 10kg', hsn: '110100', rate: 420, unit: 'bag' },
    ],
    'Pharmacy': [
      { name: 'Paracetamol 500mg', hsn: '300490', rate: 25, unit: 'strip' },
      { name: 'Vitamin C 500mg', hsn: '293627', rate: 120, unit: 'bottle' },
      { name: 'Dettol 500ml', hsn: '380894', rate: 220, unit: 'bottle' },
    ],
  };

  // 🤖 AI SUGGESTION ENGINE
  useEffect(() => {
    if (query.length > 0) {
      // 1. Exact stock matches
      const stockMatches = stock.filter(item =>
        item.itemName.toLowerCase().includes(query.toLowerCase())
      );
      
      // 2. Shop-type AI suggestions
      const shopTypeMatches = (shopTypeItems[shop.type || 'Hardware'] || [])
        .filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
      
      // 3. Fuzzy matches (first 3 letters)
      const fuzzyMatches = (shopTypeItems[shop.type || 'Hardware'] || [])
        .filter(item => item.name.toLowerCase().startsWith(query.toLowerCase().slice(0, 3)));

      setSuggestions([
        ...stockMatches.slice(0, 3),
        ...shopTypeMatches.slice(0, 2),
        ...fuzzyMatches.slice(0, 2)
      ].slice(0, 6));
    } else {
      // Default: Most popular items from stock + shop-type
      setSuggestions([
        ...stock.slice(0, 3),
        ...(shopTypeItems[shop.type || 'Hardware'] || []).slice(0, 3)
      ]);
    }
  }, [query, stock, shop.type]);

  const selectSuggestion = useCallback((item) => {
    onSelectItem({
      itemName: item.itemName || item.name,
      hsn: item.hsn || '999999',
      rate: item.rate || 0,
      unit: item.unit || 'pcs',
      quantity: 1,
    });
    setQuery('');
  }, [onSelectItem]);

  const renderSuggestion = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.suggestion, index === 0 && styles.topSuggestion]}
      onPress={() => selectSuggestion(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionName}>{item.itemName || item.name}</Text>
      <View style={styles.suggestionMeta}>
        {item.hsn && <Text style={styles.suggestionHsn}>HSN: {item.hsn}</Text>}
        <Text style={styles.suggestionRate}>₹{item.rate?.toFixed(0) || 0}</Text>
        <Text style={styles.suggestionUnit}>{item.unit || 'pcs'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholder={`🔍 ${shop.type || 'Hardware'} items... (type 2 letters)`}
        value={query}
        onChangeText={setQuery}
        autoFocus={false}
      />
      
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item, idx) => `${item.itemName || item.name}-${idx}`}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
      
      {query.length === 0 && (
        <Text style={styles.hint}>
          🤖 AI suggests top {shop.type || 'Hardware'} items • {suggestions.length} available
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20, zIndex: 1000 },
  input: {
    borderWidth: 2,
    borderColor: '#667eea',
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#fff',
    fontSize: 17,
    fontWeight: '600',
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  list: { 
    maxHeight: 240, 
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  topSuggestion: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  suggestion: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f3ff',
    backgroundColor: '#fff',
  },
  suggestionName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333',
    marginBottom: 4,
  },
  suggestionMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  suggestionHsn: { fontSize: 13, color: '#667eea', fontWeight: '600' },
  suggestionRate: { fontSize: 16, color: '#4CAF50', fontWeight: '700' },
  suggestionUnit: { fontSize: 13, color: '#999' },
  hint: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default AiSmartInput;
