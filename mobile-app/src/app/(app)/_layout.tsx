import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { FloatingChatbot } from '../../components/FloatingChatbot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addNotificationResponseListener } from '@/services/notifications';

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    // Tapping a push notification (new message, status update, alert
    // acknowledged/resolved) takes the user straight to the relevant screen.
    const unsubscribe = addNotificationResponseListener((data) => {
      if (data.type === 'incident' || data.type === 'message') {
        if (data.incidentId) router.push(`/(app)/incident/${data.incidentId}` as any);
      } else if (data.type === 'alert') {
        router.push('/(app)/alerts' as any);
      }
    });
    return unsubscribe;
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#b91c1c', // red-700
          },
          headerTintColor: '#fff',
          tabBarActiveTintColor: '#b91c1c',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 85 : 65 + insets.bottom,
            paddingBottom: Platform.OS === 'ios' ? 25 : Math.max(15, insets.bottom),
            paddingTop: 10,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Report',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="warning" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        {/* Hide incidents from tab bar — accessed from Profile */}
        <Tabs.Screen
          name="incidents"
          options={{
            href: null,
            title: 'My Reports',
          }}
        />
        {/* Hidden — two-way chat for a single incident, pushed from the incidents list */}
        <Tabs.Screen
          name="incident/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
      <FloatingChatbot />
    </View>
  );
}
