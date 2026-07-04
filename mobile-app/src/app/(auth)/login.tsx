import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await api.post('/api/auth/login', { 
        institutional_email: email, 
        password 
      });
      
      if (result.success && result.data.token) {
        await login(result.data.token);
      } else {
        Alert.alert('Login Failed', result.error || 'Please check your credentials and try again.');
      }
    } catch (err: any) {
      Alert.alert('Network Error', err.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // MOCK
      setTimeout(async () => {
        await login('mock_google_token_123');
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>S.A.F.E.</Text>
        <Text style={styles.subtitle}>Student Alert & Fast Emergency</Text>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>
        
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.googleButtonText}>Sign In with Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#b91c1c', // red-700
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 48,
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  primaryButton: {
    backgroundColor: '#b91c1c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#b91c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 32,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 15,
  },
  registerLink: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
