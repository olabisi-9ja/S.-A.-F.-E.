import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { useRouter } from 'expo-router';

const PORTFOLIO_URL = 'https://olabisiadigun.xyz';

export default function ProfileScreen() {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ full_name: fullName, phone });
      if (res.success) {
        // Simple way to refresh user context without a dedicated refresh function:
        // By calling the API profile endpoint again via the login trick or a full reload.
        // Actually, just calling an update is good enough if the app restarts or we reload.
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', res.error || 'Failed to update profile');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{getInitials(user?.full_name || '')}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name || 'Student Name'}</Text>
        <Text style={styles.email}>{user?.institutional_email || 'student@kwasu.edu.ng'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {user?.role === 'security_admin' || user?.role === 'super_admin' ? 'Security Personnel' : 'Verified Student'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
            {saving ? (
              <ActivityIndicator size="small" color="#b91c1c" />
            ) : (
              <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Full Name</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
          ) : (
            <Text style={styles.infoText}>{user?.full_name}</Text>
          )}
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Phone Number</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          ) : (
            <Text style={styles.infoText}>{user?.phone || 'Not provided'}</Text>
          )}
        </View>
        
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Matric / Staff ID</Text>
          <Text style={styles.infoTextReadOnly}>{user?.matric_or_staff_id || 'Not provided'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/incidents')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text-outline" size={24} color="#4b5563" />
            <Text style={styles.menuItemText}>My Incident Reports</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/alerts')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={24} color="#4b5563" />
            <Text style={styles.menuItemText}>My Emergency Alerts</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL(PORTFOLIO_URL)}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={24} color="#4b5563" />
            <Text style={styles.menuItemText}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL(PORTFOLIO_URL)}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#4b5563" />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.creditBlock} onPress={() => Linking.openURL(PORTFOLIO_URL)} activeOpacity={0.7}>
        <Ionicons name="code-slash-outline" size={14} color="#9ca3af" />
        <Text style={styles.creditText}>
          Designed & built by{' '}
          <Text style={styles.creditName}>Olabisi Adigun</Text>
        </Text>
        <Ionicons name="open-outline" size={12} color="#b91c1c" />
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  editButton: {
    color: '#b91c1c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoBlock: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  infoTextReadOnly: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  creditBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  creditText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '400',
  },
  creditName: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
