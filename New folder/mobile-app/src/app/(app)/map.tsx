import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { alertsAPI, analyticsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      
      try {
        let loc = await Location.getLastKnownPositionAsync({});
        if (loc) {
          setLocation(loc);
        }
        
        let currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLoc);
      } catch (err) {
        if (!location) setErrorMsg('Failed to fetch location');
      }

      // Fetch live map data
      try {
        const [alertsRes, hotspotsRes] = await Promise.all([
          alertsAPI.getActive(),
          analyticsAPI.getHotspots(30)
        ]);

        if (alertsRes.success && alertsRes.data?.alerts) {
          setActiveAlerts(alertsRes.data.alerts);
        }
        if (hotspotsRes.success && hotspotsRes.data?.hotspots) {
          setHotspots(hotspotsRes.data.hotspots);
        }
      } catch (e) {
        console.error('Failed to fetch map data', e);
      }
    })();
  }, []);

  const getMarkerColor = (mode: string) => {
    return mode === 'mesh' ? '#f59e0b' : '#ef4444'; // Orange for mesh, Red for standard
  };

  if (!location && !errorMsg) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b91c1c" />
        <Text style={styles.loadingText}>Connecting to satellites...</Text>
      </View>
    );
  }

  const initialRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : {
    // Default to KWASU
    latitude: 8.8091, 
    longitude: 4.6738,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User Location Safe Zone (Visual Reference) */}
        {location && (
          <Circle
            center={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            radius={150}
            fillColor="rgba(34, 197, 94, 0.15)"
            strokeColor="rgba(34, 197, 94, 0.4)"
            strokeWidth={1}
          />
        )}

        {/* KWASU Base */}
        <Marker
          coordinate={{ latitude: 8.8091, longitude: 4.6738 }}
          title="Campus Security Base"
          description="Central Response Hub"
        >
          <View style={styles.baseMarker}>
            <Ionicons name="shield" size={16} color="white" />
          </View>
        </Marker>

        {/* AI Hotspots */}
        {hotspots.map((spot, index) => (
          <Circle
            key={`hotspot-${index}`}
            center={{
              latitude: parseFloat(spot.latitude),
              longitude: parseFloat(spot.longitude),
            }}
            radius={250} // 250 meters approx
            fillColor="rgba(245, 158, 11, 0.2)"
            strokeColor="rgba(245, 158, 11, 0.5)"
            strokeWidth={1}
          />
        ))}

        {/* Active Emergency Alerts */}
        {activeAlerts.map(alert => (
          <Marker
            key={`alert-${alert.id}`}
            coordinate={{
              latitude: parseFloat(alert.latitude),
              longitude: parseFloat(alert.longitude),
            }}
            title={`SOS Alert #${alert.id}`}
            description={alert.acknowledged ? 'Security is en route' : 'Pending Response'}
          >
            <View style={styles.alertMarkerContainer}>
              <View style={[styles.alertMarkerPulse, { borderColor: getMarkerColor(alert.transmission_mode) }]} />
              <View style={[styles.alertMarker, { backgroundColor: getMarkerColor(alert.transmission_mode) }]}>
                <Ionicons name="warning" size={14} color="white" />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Campus Safety Map</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Active SOS</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Mesh SOS</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.legendText}>Your Zone</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  baseMarker: {
    backgroundColor: '#1f2937',
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  alertMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  alertMarkerPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    opacity: 0.5,
  },
  alertMarker: {
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
