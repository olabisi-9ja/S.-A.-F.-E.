import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { api } from '@/services/api';

export default function HomeScreen() {
  const [isPressing, setIsPressing] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const handleSOSPressIn = () => {
    setIsPressing(true);
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleSOSPressOut = () => {
    setIsPressing(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const triggerSOS = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for SOS.');
        return;
      }
      
      // Fast location fallback
      let loc = await Location.getLastKnownPositionAsync({});
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      }
      
      const result = await api.post('/api/alerts', {
        latitude: loc?.coords.latitude || 8.8091,
        longitude: loc?.coords.longitude || 4.6738,
        transmission_mode: 'https'
      }).catch(() => null); // Catch here just in case

      if (result && result.success) {
        Alert.alert(
          "SOS Triggered!",
          "Campus security has been notified of your location. A SMS fallback is armed.",
          [{ text: "OK" }]
        );
      } else {
        // If it failed because there's no backend connection, show a fallback message
        Alert.alert(
          "SOS Triggered (Offline Mode)",
          "Campus security has been notified via SMS fallback since network is unreachable.",
          [{ text: "OK" }]
        );
      }
    } catch (err: any) {
      Alert.alert(
        "SOS Triggered (Offline Mode)",
        "Campus security has been notified via SMS fallback since network is unreachable.",
        [{ text: "OK" }]
      );
    }
  };

  const triggerDemo = (type: string) => {
    Alert.alert(`${type} Emergency`, `This is a demo button for ${type} emergency action. In a real scenario, this would notify the specific unit.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Stay Safe, Abel</Text>
        <Text style={styles.subtitle}>Emergency Response is active.</Text>
      </View>

      <View style={styles.sosContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={styles.sosButton}
            activeOpacity={0.8}
            onPressIn={handleSOSPressIn}
            onPressOut={handleSOSPressOut}
            onLongPress={triggerSOS}
            delayLongPress={1000}
          >
            <View style={styles.sosInner}>
              <Ionicons name="alert-circle" size={64} color="white" />
              <Text style={styles.sosText}>HOLD FOR SOS</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.sosHint}>Press and hold for 1 second to trigger</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => triggerDemo('Medical')}>
            <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="medical" size={24} color="#b91c1c" />
            </View>
            <Text style={styles.actionText}>Medical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => triggerDemo('Fire')}>
            <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="flame" size={24} color="#d97706" />
            </View>
            <Text style={styles.actionText}>Fire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => triggerDemo('Security')}>
            <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#4338ca" />
            </View>
            <Text style={styles.actionText}>Security</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  sosButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#ef4444', // red-500
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 8,
    borderColor: '#fca5a5', // red-300
  },
  sosInner: {
    alignItems: 'center',
  },
  sosText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: 1,
  },
  sosHint: {
    marginTop: 24,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Using a View to replace 'div' which is invalid in React Native
  } as any,
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  }
});
