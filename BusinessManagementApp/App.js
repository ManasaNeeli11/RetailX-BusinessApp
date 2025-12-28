// App.js - FIXED WITH YOUR EXISTING SCREENS ONLY
import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

import store, { persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';

import InvoiceScreen from './screens/InvoiceScreen';
import CustomerPendingScreen from './screens/CustomerPendingScreen';
import DealerPaymentsScreen from './screens/DealerPaymentsScreen';
import StockManagementScreen from './screens/StockManagementScreen';
import QuotationScreen from './screens/QuotationScreen';
import TransactionTrackingScreen from './screens/TransactionTrackingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import AlertsScreen from './screens/AlertsScreen'; // ✅ NEW - You have this!
import { AuthProvider, useAuth } from './screens/AuthContext';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const LogoutScreen = () => {
  const { logout } = useAuth();
  React.useEffect(() => {
    logout();
  }, [logout]);
  return null;
};

// ✅ CUSTOM MENU ICONS
function MenuIcon({ name, color, size = 24 }) {
  const icons = {
    'Welcome': '🏠',
    'Create Invoice': '📄',
    'Customer Pending': '👥',
    'Dealer Payments': '🏪',
    'Stock Management': '📦',
    'Quotations': '📋',
    'Transactions': '💰',
    'Alerts': '🚨',           // ✅ NEW
    'Logout': '🚪',
  };
  return (
    <Text style={{ fontSize: size, marginRight: 12, opacity: 0.9 }}>
      {icons[name] || '⚙️'}
    </Text>
  );
}

// ✨ MAIN DRAWER - YOUR 8 SCREENS + ALERTS
function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        drawerActiveTintColor: '#667eea',
        drawerActiveBackgroundColor: 'rgba(102, 126, 234, 0.15)',
        drawerInactiveTintColor: '#8e8e93',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -8,
        },
        drawerStyle: {
          backgroundColor: '#f8f9ff',
          width: 280,
        },
      }}
    >
      {/* 🏠 1. WELCOME (Your Home Screen) */}
      <Drawer.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={styles.drawerLabel}>
              <MenuIcon name="Welcome" color={focused ? '#667eea' : '#8e8e93'} />
              <Text style={[
                styles.drawerLabelText,
                focused && styles.drawerLabelTextActive
              ]}>
                Home
              </Text>
            </View>
          ),
        })}
      />

      {/* 💼 2-7. YOUR CORE SCREENS */}
      <Drawer.Screen 
        name="Create Invoice" 
        component={InvoiceScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={styles.drawerLabel}>
              <MenuIcon name="Create Invoice" color={focused ? '#667eea' : '#8e8e93'} />
              <Text style={[
                styles.drawerLabelText,
                focused && styles.drawerLabelTextActive
              ]}>
                Create Invoice
              </Text>
            </View>
          ),
        })}
      />
      
      <Drawer.Screen 
        name="Customer Pending" 
        component={CustomerPendingScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={styles.drawerLabel}>
              <MenuIcon name="Customer Pending" color={focused ? '#667eea' : '#8e8e93'} />
              <Text style={[
                styles.drawerLabelText,
                focused && styles.drawerLabelTextActive
              ]}>
                Customer Pending
              </Text>
            </View>
          ),
        })}
      />
      
      <Drawer.Screen 
        name="Dealer Payments" 
        component={DealerPaymentsScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={styles.drawerLabel}>
              <MenuIcon name="Dealer Payments" color={focused ? '#667eea' : '#8e8e93'} />
              <Text style={[
                styles.drawerLabelText,
                focused && styles.drawerLabelTextActive
              ]}>
                Dealer Payments
              </Text>
            </View>
          ),
        })}
      />
      
      <Drawer.Screen 
        name="Stock Management" 
        component={StockManagementScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={styles.drawerLabel}>
              <MenuIcon name="Stock Management" color={focused ? '#667eea' : '#8e8e93'} />
              <Text style={[
                styles.drawerLabelText,
                focused && styles.drawerLabelTextActive
              ]}>
                Stock Management
              </Text>
            </View>
          ),
        })}
      />
      
      <Drawer.Screen 
        name="Quotations" 
        component={QuotationScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={styles.drawerLabel}>
              <MenuIcon name="Quotations" color={focused ? '#667eea' : '#8e8e93'} />
              <Text style={[
                styles.drawerLabelText,
                focused && styles.drawerLabelTextActive
              ]}>
                Quotations
              </Text>
            </View>
          ),
        })}
      />
      
      <Drawer.Screen 
        name="Transactions" 
        component={TransactionTrackingScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={styles.drawerLabel}>
              <MenuIcon name="Transactions" color={focused ? '#667eea' : '#8e8e93'} />
              <Text style={[
                styles.drawerLabelText,
                focused && styles.drawerLabelTextActive
              ]}>
                Transactions
              </Text>
            </View>
          ),
        })}
      />

      {/* 🚨 8. ALERTS & REMINDERS - NEW! */}
      <Drawer.Screen 
        name="Alerts" 
        component={AlertsScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={styles.drawerLabel}>
              <MenuIcon name="Alerts" color={focused ? '#667eea' : '#8e8e93'} />
              <Text style={[
                styles.drawerLabelText,
                focused && styles.drawerLabelTextActive
              ]}>
                Alerts & Reminders
              </Text>
            </View>
          ),
        })}
      />

      {/* 🚪 9. LOGOUT */}
      <Drawer.Screen 
        name="Logout" 
        component={LogoutScreen}
        options={({ focused }) => ({
          drawerLabel: ({ focused }) => (
            <View style={[styles.drawerLabel, styles.logoutLabel]}>
              <MenuIcon name="Logout" color="#d32f2f" size={22} />
              <Text style={styles.logoutLabelText}>Logout</Text>
            </View>
          ),
          drawerItemStyle: { 
            borderTopWidth: 1, 
            borderTopColor: '#e1e5e9',
            marginTop: 20,
            marginBottom: 20,
            paddingTop: 15,
          },
        })}
      />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="MainApp" component={MainDrawer} />
        </>
      ) : (
        <>
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <SafeAreaProvider>
          <NavigationContainer>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  drawerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drawerLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e8e93',
  },
  drawerLabelTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  logoutLabel: {
    marginTop: 'auto',
  },
  logoutLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
  },
});
