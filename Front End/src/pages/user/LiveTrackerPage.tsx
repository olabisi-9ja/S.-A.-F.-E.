import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Shield, ArrowLeft, Navigation, Copy, Check, AlertTriangle } from 'lucide-react';
import { alertsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';

const KWASU_CENTER: [number, number] = [8.6762, 4.1680];

const alertIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.4), 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;">!</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const securityIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export function LiveTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [alertData, setAlertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  
  const isSender = user?.id === alertData?.user_id;
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Fetch initial alert data
  const fetchAlert = async () => {
    if (!id) return;
    const res = await alertsAPI.getById(id);
    if (res.success && res.data?.alert) {
      setAlertData(res.data.alert);
      fetchRoute(res.data.alert.latitude, res.data.alert.longitude);
    } else {
      setError('Emergency tracking session not found or expired.');
    }
    setLoading(false);
  };

  // Fetch route from OSRM
  const fetchRoute = async (targetLat: number, targetLng: number) => {
    try {
      // OSRM expects: longitude,latitude
      const url = `https://router.project-osrm.org/route/v1/driving/${KWASU_CENTER[1]},${KWASU_CENTER[0]};${targetLng},${targetLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // GeoJSON uses [lng, lat], Leaflet uses [lat, lng]
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        setRouteCoords(coords);
      }
    } catch (err) {
      console.error('Failed to fetch route', err);
    }
  };

  useEffect(() => {
    fetchAlert();
    
    // Cleanup watch position on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [id]);

  // Setup Live Tracking Behavior
  useEffect(() => {
    if (!alertData || !id) return;

    if (isSender) {
      // SENDER: Watch GPS and push updates
      if ('geolocation' in navigator && watchIdRef.current === null) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Update local state for map
            setAlertData((prev: any) => ({ ...prev, latitude, longitude }));
            fetchRoute(latitude, longitude);

            // Throttle backend updates to every 5 seconds
            const now = Date.now();
            if (now - lastUpdateRef.current > 5000) {
              alertsAPI.updateLocation(id, latitude, longitude).catch(console.error);
              lastUpdateRef.current = now;
            }
          },
          (err) => console.error("GPS Error:", err),
          { enableHighAccuracy: true, maximumAge: 0 }
        );
      }
    } else {
      // RECEIVER: Poll for updates every 5 seconds
      const interval = setInterval(fetchAlert, 5000);
      return () => clearInterval(interval);
    }
  }, [alertData?.id, isSender, id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading tracker...</div>;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
        <button onClick={() => navigate('/')} className="text-red-600 hover:underline">Return Home</button>
      </div>
    </div>
  );

  const center: [number, number] = [alertData.latitude, alertData.longitude];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">Live Emergency Tracking</h1>
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                ACTIVE SESSION
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Share Link'}
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={center} 
          zoom={16} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Target Location */}
          <Marker position={center} icon={alertIcon}>
            <Popup>
              <strong>Target Location</strong><br/>
              {alertData.user?.full_name || 'Student'}<br/>
              {alertData.user?.phone}
            </Popup>
          </Marker>

          {/* Security Base */}
          <Marker position={KWASU_CENTER} icon={securityIcon}>
            <Popup>KWASU Security Outpost</Popup>
          </Marker>

          {/* Route */}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="#3b82f6" weight={5} opacity={0.7} />
          )}
        </MapContainer>

        {/* Floating Info Card */}
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-[1000]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{isSender ? "Broadcasting Location" : "Tracking Subject"}</h3>
              <p className="text-xs text-gray-500">
                {isSender 
                  ? "Your live GPS is being sent to security." 
                  : `Tracking ${alertData.user?.full_name || 'student'}'s live device.`}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Coordinates</span>
              <span className="font-mono text-gray-900">{center[0].toFixed(5)}, {center[1].toFixed(5)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Distance to Base</span>
              <span className="font-medium text-gray-900">
                {((Math.abs(center[0] - KWASU_CENTER[0]) + Math.abs(center[1] - KWASU_CENTER[1])) * 111).toFixed(1)} km
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
