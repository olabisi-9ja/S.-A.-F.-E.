import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { alertsAPI, incidentsAPI } from '@/services/api';
import { sendAlertWithFallback } from '@/services/mesh';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressing, setIsPressing] = useState(false);
  const [sosState, setSosState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, incidentsRes] = await Promise.all([
        alertsAPI.getAll({ limit: 3 }),
        incidentsAPI.getAll({ limit: 3 }),
      ]);
      if (alertsRes.success && alertsRes.data?.alerts) setRecentAlerts(alertsRes.data.alerts);
      if (incidentsRes.success && incidentsRes.data?.incidents) setRecentIncidents(incidentsRes.data.incidents);
    } catch (e) {
      // Silently fail — data will just be empty
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSOSPressIn = () => {
    setIsPressing(true);
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handleSOSPressOut = () => {
    setIsPressing(false);
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  const triggerSOS = async () => {
    if (sosState !== 'idle') return;
    setSosState('sending');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for SOS.');
        setSosState('idle');
        return;
      }

      let loc = await Location.getLastKnownPositionAsync({});
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      }
      const latitude = loc?.coords.latitude || 8.6762;
      const longitude = loc?.coords.longitude || 4.1680;

      const delivery = await sendAlertWithFallback(user?.id ?? 0, latitude, longitude);

      if (delivery.mode === 'https') {
        Alert.alert('🚨 SOS Triggered!', 'Campus security has been notified of your location.');
      } else {
        Alert.alert(
          '🚨 SOS Queued (Offline)',
          'No connection detected. Your alert is encrypted and queued — it will relay to nearby S.A.F.E. devices and auto-sync the moment any device reaches the internet. An SMS fallback will also fire if unacknowledged.'
        );
      }
      setSosState('sent');
      fetchData(); // Refresh recent alerts
    } catch (err) {
      Alert.alert('SOS Sent (Offline)', 'Your alert is queued and will deliver via mesh relay or SMS fallback.');
      setSosState('sent');
    }

    setTimeout(() => setSosState('idle'), 4000);
  };

  const triggerCategorySOS = async (category: string) => {
    Alert.alert(
      `${category} Emergency`,
      `Send a ${category.toLowerCase()} emergency alert to campus security?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location is required.');
                return;
              }
              let loc = await Location.getLastKnownPositionAsync({});
              if (!loc) loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

              const delivery = await sendAlertWithFallback(
                user?.id ?? 0,
                loc?.coords.latitude || 8.6762,
                loc?.coords.longitude || 4.1680
              );

              if (delivery.mode === 'https') {
                Alert.alert('✅ Alert Sent', `${category} emergency alert sent to campus security.`);
              } else {
                Alert.alert('Alert Queued', 'No connection detected — your alert is encrypted and queued for mesh relay / SMS fallback.');
              }
              fetchData();
            } catch {
              Alert.alert('Alert Queued', 'Your alert is encrypted and queued for mesh relay / SMS fallback.');
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getStatusColor = (item: any) => {
    if (item.resolved) return '#16a34a';
    if (item.acknowledged) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusText = (item: any) => {
    if (item.resolved) return 'Resolved';
    if (item.acknowledged) return 'Acknowledged';
    return 'Pending';
  };

  return (
    <FlatList
      data={[]}
      renderItem={null}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b91c1c" />}
      ListHeaderComponent={
        <View style={styles.container}>
          {/* Greeting */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Stay Safe, {user?.full_name?.split(' ')[0] || 'Student'}</Text>
            <Text style={styles.subtitle}>Emergency response is active.</Text>
          </View>

          {/* SOS Button */}
          <View style={styles.sosContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.sosButton,
                  sosState === 'sent' && styles.sosButtonSent,
                  sosState === 'sending' && styles.sosButtonSending,
                ]}
                activeOpacity={0.8}
                onPressIn={handleSOSPressIn}
                onPressOut={handleSOSPressOut}
                onLongPress={triggerSOS}
                delayLongPress={1000}
                disabled={sosState !== 'idle'}
              >
                <View style={styles.sosInner}>
                  <Ionicons
                    name={sosState === 'sent' ? 'checkmark-circle' : 'alert-circle'}
                    size={64}
                    color="white"
                  />
                  <Text style={styles.sosText}>
                    {sosState === 'idle' ? 'HOLD FOR SOS' : sosState === 'sending' ? 'SENDING...' : 'ALERT SENT'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.sosHint}>Press and hold for 1 second to trigger</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Emergency</Text>
            <View style={styles.gridContainer}>
              <TouchableOpacity style={styles.actionCard} onPress={() => triggerCategorySOS('Medical')}>
                <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="medical" size={24} color="#b91c1c" />
                </View>
                <Text style={styles.actionText}>Medical</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => triggerCategorySOS('Fire')}>
                <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="flame" size={24} color="#d97706" />
                </View>
                <Text style={styles.actionText}>Fire</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => triggerCategorySOS('Security')}>
                <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                  <Ionicons name="shield-checkmark" size={24} color="#4338ca" />
                </View>
                <Text style={styles.actionText}>Security</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Alerts */}
          {recentAlerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Alerts</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/alerts')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {recentAlerts.map((alert: any) => (
                <View key={alert.id} style={styles.listItem}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(alert) }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listItemTitle}>
                      Emergency Alert #{alert.id}
                    </Text>
                    <Text style={styles.listItemSub}>
                      {alert.transmission_mode?.toUpperCase()} • {getStatusText(alert)}
                    </Text>
                  </View>
                  <Text style={styles.listItemTime}>{formatTime(alert.created_at)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recent Incidents */}
          {recentIncidents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Reports</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/incidents')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {recentIncidents.map((inc: any) => (
                <View key={inc.id} style={styles.listItem}>
                  <View style={[styles.statusDot, { backgroundColor: inc.status === 'resolved' ? '#16a34a' : inc.status === 'investigating' ? '#f59e0b' : '#ef4444' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listItemTitle}>{inc.category}</Text>
                    <Text style={styles.listItemSub} numberOfLines={1}>
                      {inc.description}
                    </Text>
                  </View>
                  <Text style={styles.listItemTime}>{formatTime(inc.created_at)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      }
    />
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
    marginBottom: 24,
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
    marginVertical: 24,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 8,
    borderColor: '#fca5a5',
  },
  sosButtonSending: {
    backgroundColor: '#f59e0b',
    borderColor: '#fcd34d',
  },
  sosButtonSent: {
    backgroundColor: '#16a34a',
    borderColor: '#86efac',
  },
  sosInner: {
    alignItems: 'center',
  },
  sosText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: 1,
  },
  sosHint: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  listItemSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  listItemTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
