import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    setLoading(true);
    try {
      const result = await api.post('/api/auth/register', { 
        full_name: fullName, 
        institutional_email: email, 
        phone, 
        password 
      });
      
      if (result.success) {
        Alert.alert(
          'Registration Successful',
          'Please check your email for the verification link.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Something went wrong.');
      }
    } catch (err: any) {
      Alert.alert('Network Error', err.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join S.A.F.E. to keep your campus secure.</Text>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Student Email address"
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Register</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign In</Text>
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
    fontSize: 36,
    fontWeight: '900',
    color: '#1f2937', 
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    fontWeight: '500',
  },
  formContainer: {
    gap: 16,
    marginBottom: 32,
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
    backgroundColor: '#1f2937', // Dark gray/black for register
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  loginLink: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
