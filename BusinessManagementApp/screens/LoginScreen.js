// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // AuthContext will update user and AppNavigator will show Welcome
      })
      .catch(error => {
        console.log('WEB LOGIN ERROR:', error.code, error.message);

        let message = 'Login failed';
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password'
        ) {
          message = 'Invalid email or password';
        } else if (error.code === 'auth/too-many-requests') {
          message = 'Too many attempts. Try again later';
        } else if (error.code === 'auth/invalid-api-key') {
          message = 'Invalid API key configuration';
        } else if (error.code === 'auth/unauthorized-domain') {
          message = 'This domain is not authorized in Firebase Authentication settings.';
        }
        Alert.alert('Error', message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to RetailX</Text>

      <TextInput
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ marginVertical: 20 }} />
      ) : (
        <Button title="Login" onPress={handleLogin} color="#6200EE" />
      )}

      <TouchableOpacity onPress={() => navigation.replace('Signup')} style={{ marginTop: 20 }}>
        <Text style={styles.link}>New here? Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f8f9fa' },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#6200EE', marginBottom: 10 },
  subtitle: { fontSize: 20, textAlign: 'center', color: '#666', marginBottom: 40 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 17,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  link: { textAlign: 'center', color: '#6200EE', fontSize: 16, fontWeight: '600' },
});

export default LoginScreen;
