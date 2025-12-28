// screens/WelcomeScreen.js - FIXED NAVIGATION TO CREATE INVOICE
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const exploreRetailX = () => {
    // ✅ FIXED: Navigate to MainApp → Create Invoice
    navigation.navigate('MainApp', { screen: 'Create Invoice' });
  };

  const goToAlerts = () => {
    navigation.navigate('MainApp', { screen: 'Alerts' });
  };

  const goToTransactions = () => {
    navigation.navigate('MainApp', { screen: 'Transactions' });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RetailX Pro</Text>
        <Text style={styles.subtitle}>Business Management Simplified</Text>
      </View>

      {/* Main CTA - Explore RetailX */}
      <TouchableOpacity style={styles.exploreButton} onPress={exploreRetailX}>
        <Text style={styles.exploreButtonText}>🚀 Explore RetailX</Text>
      </TouchableOpacity>

      {/* Quick Stats Preview */}
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Quick Access</Text>
        <View style={styles.previewRow}>
          <TouchableOpacity 
            style={styles.previewItem}
            onPress={goToAlerts}
            accessibilityRole="button"
            accessibilityLabel="Alerts and Reminders"
          >
            <Text style={styles.previewIcon}>🚨</Text>
            <Text style={styles.previewText}>Alerts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.previewItem}
            onPress={goToTransactions}
            accessibilityRole="button"
            accessibilityLabel="Transactions"
          >
            <Text style={styles.previewIcon}>💰</Text>
            <Text style={styles.previewText}>Transactions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feature Highlights */}
      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>✨ Features</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📄</Text>
            <Text style={styles.featureText}>Invoice Creation</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📦</Text>
            <Text style={styles.featureText}>Stock Management</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚨</Text>
            <Text style={styles.featureText}>Smart Alerts</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>AI Suggestions</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// ✅ SAME POLISHED STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#667eea',
    marginHorizontal: 40,
    marginVertical: 30,
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  previewCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginVertical: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewItem: {
    alignItems: 'center',
    padding: 16,
    flex: 0.45,
  },
  previewIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featuresCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginVertical: 20,
    marginBottom: 40,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
});

export default WelcomeScreen;
