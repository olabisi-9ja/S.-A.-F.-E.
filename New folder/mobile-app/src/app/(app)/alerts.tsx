import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { alertsAPI } from '@/services/api';
import { useRouter } from 'expo-router';
import { getQueuedPacketCount, syncQueuedPackets } from '@/services/mesh';

export default function AlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      const res = await alertsAPI.getAll();
      if (res.success && res.data) {
        setAlerts(res.data.alerts || []);
      } else {
        setError(res.error || 'Failed to fetch alerts');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshQueueCount = useCallback(async () => {
    setQueuedCount(await getQueuedPacketCount());
  }, []);

  useEffect(() => {
    fetchAlerts();
    refreshQueueCount();
  }, [fetchAlerts, refreshQueueCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAlerts(), refreshQueueCount()]);
    setRefreshing(false);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    const { synced } = await syncQueuedPackets();
    setSyncing(false);
    await refreshQueueCount();
    if (synced > 0) await fetchAlerts();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#b91c1c" />
        <Text style={styles.loadingText}>Loading your alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alert History</Text>
        <Text style={styles.subtitle}>Your past emergency triggers</Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning" size={20} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {queuedCount > 0 && (
        <View style={styles.meshBanner}>
          <Ionicons name="bluetooth" size={20} color="#4338ca" />
          <Text style={styles.meshBannerText}>
            {queuedCount} alert{queuedCount > 1 ? 's' : ''} queued offline — waiting to relay/sync.
          </Text>
          <TouchableOpacity style={styles.syncButton} onPress={handleSyncNow} disabled={syncing}>
            {syncing ? <ActivityIndicator size="small" color="#4338ca" /> : <Text style={styles.syncButtonText}>Sync now</Text>}
          </TouchableOpacity>
        </View>
      )}

      {alerts.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No alerts found</Text>
          <Text style={styles.emptySub}>You haven't triggered any emergencies yet.</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b91c1c" />}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/map`)} // Simple redirect to map for now
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgeContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(item) }]}>{getStatusText(item)}</Text>
                </View>
                <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Emergency Alert #{item.id}</Text>
                
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="radio-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    Transmission: {item.transmission_mode?.toUpperCase() || 'HTTPS'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#b91c1c',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  meshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    padding: 14,
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
  },
  meshBannerText: {
    flex: 1,
    color: '#4338ca',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    lineHeight: 18,
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  syncButtonText: {
    color: '#4338ca',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  cardBody: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
});
