// store.js - FIXED (No more expo-notifications errors)
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

const initialState = {
  shop: {
    name: 'My Shop',
    address: '123 Main Street, City, State, ZIP',
    phone: '123-456-7890',
    gst: 'GSTIN123456',
  },
  invoices: [],
  customers: [], // {name, phone, allowedLimit, pending: [{amount, dueDate}], history: []}
  dealers: [], // {name, toPay: 0, paid: 0, billed: 0, history: []}
  stock: [], // {itemName, hsn, quantity, rate, unit, minLimit, dealer}
  quotations: [],
  transactions: { cash: [], online: [] },
  reminders: [],
};

const rootReducer = combineReducers({
  app: (state = initialState, action) => {
    switch (action.type) {
      case 'CREATE_INVOICE':
        const newInvoices = [...state.invoices, action.payload];
        const updatedStock = state.stock.map(item => {
          const billedItem = action.payload.items.find(i => i.itemName === item.itemName);
          if (billedItem) {
            const newQty = Math.max(0, item.quantity - billedItem.quantity);
            return { ...item, quantity: newQty };
          }
          return item;
        });
        
        // Update customer pending
        let updatedCustomers = [...state.customers];
        const customerIndex = updatedCustomers.findIndex(c => c.name === action.payload.customer.name);
        const newPending = { amount: action.payload.total, dueDate: action.payload.dueDate };
        if (customerIndex !== -1) {
          updatedCustomers[customerIndex].pending.push(newPending);
          updatedCustomers[customerIndex].history.push(action.payload);
        } else {
          updatedCustomers.push({
            name: action.payload.customer.name,
            phone: action.payload.customer.phone,
            allowedLimit: 10000,
            pending: [newPending],
            history: [action.payload],
          });
        }
        
        const customer = updatedCustomers[customerIndex !== -1 ? customerIndex : updatedCustomers.length - 1];
        const sumPending = customer.pending.reduce((sum, p) => sum + (p.amount || 0), 0);
        if (sumPending > customer.allowedLimit) {
          console.log('⚠️ PENDING LIMIT EXCEEDED:', `${customer.name} has exceeded the allowed pending limit.`);
        }
        if (action.payload.dueDate) {
          console.log('📅 REMINDER SET:', `Payment due for ${customer.name} on ${action.payload.dueDate}`);
        }
        console.log('📋 NEW INVOICE:', `Invoice ${action.payload.invoiceNumber}`);
        
        return { ...state, invoices: newInvoices, stock: updatedStock, customers: updatedCustomers };
      
      case 'ADD_STOCK':
        let updatedStockAdd = [...state.stock];
        const existingIndex = updatedStockAdd.findIndex(i => i.itemName === action.payload.itemName);
        const purchaseTotal = (action.payload.quantity || 0) * (action.payload.rate || 0);
        
        if (existingIndex !== -1) {
          updatedStockAdd[existingIndex].quantity += action.payload.quantity || 0;
        } else {
          updatedStockAdd.push(action.payload);
        }
        
        // Update dealer for purchase
        let updatedDealers = [...state.dealers];
        const dealerIndex = updatedDealers.findIndex(d => d.name === action.payload.dealer);
        if (dealerIndex !== -1) {
          updatedDealers[dealerIndex].billed += purchaseTotal;
          updatedDealers[dealerIndex].toPay = Math.max(0, updatedDealers[dealerIndex].billed - updatedDealers[dealerIndex].paid);
          updatedDealers[dealerIndex].history.push({
            type: 'purchase',
            date: new Date().toISOString(),
            amount: purchaseTotal,
            itemName: action.payload.itemName,
            quantity: action.payload.quantity,
          });
        } else if (purchaseTotal > 0) {
          updatedDealers.push({
            name: action.payload.dealer,
            toPay: purchaseTotal,
            paid: 0,
            billed: purchaseTotal,
            history: [{
              type: 'purchase',
              date: new Date().toISOString(),
              amount: purchaseTotal,
              itemName: action.payload.itemName,
              quantity: action.payload.quantity,
            }],
          });
        }
        return { ...state, stock: updatedStockAdd, dealers: updatedDealers };
      
      case 'CREATE_QUOTATION':
        return { ...state, quotations: [...state.quotations, action.payload] };
      
      case 'ADD_TRANSACTION':
        const transType = action.payload.type === 'online' ? 'online' : 'cash';
        if ((action.payload.amount || 0) > 0) {
          return { 
            ...state, 
            transactions: { 
              ...state.transactions, 
              [transType]: [...state.transactions[transType], action.payload] 
            } 
          };
        }
        return state;
      
      case 'PAY_DEALER':
        let updatedDealersPay = [...state.dealers];
        const payDealerIndex = updatedDealersPay.findIndex(d => d.name === action.payload.dealer);
        const paymentAmount = Math.max(0, action.payload.amount || 0);
        
        if (payDealerIndex !== -1) {
          updatedDealersPay[payDealerIndex].paid += paymentAmount;
          updatedDealersPay[payDealerIndex].toPay = Math.max(0, updatedDealersPay[payDealerIndex].billed - updatedDealersPay[payDealerIndex].paid);
          updatedDealersPay[payDealerIndex].history.push({
            type: 'payment',
            date: action.payload.date || new Date().toISOString(),
            amount: paymentAmount,
          });
        } else if (paymentAmount > 0) {
          updatedDealersPay.push({
            name: action.payload.dealer,
            toPay: 0,
            paid: paymentAmount,
            billed: 0,
            history: [{
              type: 'payment',
              date: action.payload.date || new Date().toISOString(),
              amount: paymentAmount,
            }],
          });
        }
        return { ...state, dealers: updatedDealersPay };
      
      // NEW: Clear invalid (zero amount) dealer history
      case 'CLEAR_INVALID_DEALER_HISTORY':
        return {
          ...state,
          dealers: state.dealers.map(dealer => ({
            ...dealer,
            history: (dealer.history || []).filter(h => (h.amount || 0) > 0)
          }))
        };
      
      // NEW: Reset specific dealer
      case 'RESET_DEALER':
        return {
          ...state,
          dealers: state.dealers.map(dealer => 
            dealer.name === action.payload 
              ? { 
                  ...dealer, 
                  paid: 0, 
                  toPay: dealer.billed || 0, 
                  history: [] 
                }
              : dealer
          )
        };
      
      default:
        return state;
    }
  },
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
