import { MapPin, Radio, AlertTriangle, ArrowLeft, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getRealHotspots } from '../../utils/mapUtils';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const KWASU_CENTER: [number, number] = [8.6762, 4.1680];

const incidentIcon = (status: string) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: ${status === 'in_progress' ? '#d97706' : '#dc2626'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">!</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const alertIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: #f97316; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 8px; box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.4), 0 2px 4px rgba(0,0,0,0.3);">SOS</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export function AdminMapPage() {
  const { incidents, alerts } = useApp();
  const navigate = useNavigate();

  const activeAlerts = alerts.filter(a => !a.resolved);
  const realHotspots = getRealHotspots(incidents);

  return (
    <div className="min-h-screen bg-gray-50 pt-14 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-5 flex flex-col h-full">
        <div>
          <button onClick={() => window.location.href = '/admin-dashboard'} className="inline-flex items-center gap-1 text-sm text-red-700 hover:bg-red-50 px-2 py-1 -ml-2 rounded-lg transition font-medium mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            Live Campus Map
          </h2>
          <p className="text-sm text-gray-500">Real-time visualization of incidents and active patrols.</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {[
            { color: 'bg-red-500', label: 'Unresolved Incident' },
            { color: 'bg-amber-500', label: 'In Progress' },
            { color: 'bg-green-500', label: 'Resolved' },
            { color: 'bg-purple-500', label: 'AI Hotspot Cluster' },
            { color: 'bg-orange-500', label: 'Emergency Alert' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              {label}
            </div>
          ))}
        </div>

        {/* Interactive Leaflet Map */}
        <Card className="overflow-hidden">
          <div className="relative rounded-xl overflow-hidden" style={{ height: '500px' }}>
            <MapContainer 
              center={KWASU_CENTER} 
              zoom={15} 
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Hotspot Clusters */}
              {realHotspots.map((spot, i) => (
                <Circle
                  key={`hotspot-${i}`}
                  center={[spot.latitude, spot.longitude]}
                  radius={spot.count * 20}
                  pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.2 }}
                >
                  <Popup>
                    <strong>{spot.label}</strong><br/>
                    {spot.count} incidents in this cluster
                  </Popup>
                </Circle>
              ))}

              {/* Active Alerts (SOS) */}
              {activeAlerts.map(alert => {
                if (!alert.latitude || !alert.longitude) return null;
                return (
                  <Marker 
                    key={`alert-${alert.id}`} 
                    position={[alert.latitude, alert.longitude]} 
                    icon={alertIcon}
                  >
                    <Popup>
                      <strong>🚨 SOS Emergency</strong><br/>
                      User: {alert.user_name}<br/>
                      Mode: {alert.transmission_mode}
                    </Popup>
                  </Marker>
                );
              })}

              {/* Ongoing Incidents */}
              {incidents.filter(i => i.status !== 'resolved').map(inc => {
                if (!inc.latitude || !inc.longitude) return null;
                return (
                  <Marker 
                    key={`inc-${inc.id}`} 
                    position={[inc.latitude, inc.longitude]} 
                    icon={incidentIcon(inc.status)}
                  >
                    <Popup>
                      <strong>{inc.category}</strong><br/>
                      Status: {inc.status}<br/>
                      AI Severity: {inc.ai_severity_score}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Map label */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow z-[1000] pointer-events-none">
              Kwara State University, Malete Campus (Live)
            </div>
          </div>
        </Card>

        {/* Active items list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Active Emergencies
              </h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeAlerts.length === 0 && (
                <p className="text-sm text-gray-400 py-3 text-center">No active emergencies</p>
              )}
              {activeAlerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-3 p-2.5 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{alert.user_name}</p>
                    <p className="text-xs text-gray-400">{Number(alert.latitude).toFixed(4)}, {Number(alert.longitude).toFixed(4)}</p>
                  </div>
                  {alert.transmission_mode === 'mesh' && (
                    <Badge variant="mesh"><Radio className="w-3 h-3" />Mesh</Badge>
                  )}
                  <button
                    onClick={() => navigate('/track/' + alert.id)}
                    className="ml-auto text-xs px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium border border-red-200 flex items-center gap-1 shrink-0"
                  >
                    <Navigation className="w-3 h-3" />
                    Track
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                DBSCAN Hotspot Clusters
              </h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {realHotspots.length === 0 && (
                <p className="text-sm text-gray-400 py-3 text-center">No hotspots detected</p>
              )}
              {realHotspots.map((spot, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    spot.count >= 10 ? 'bg-red-500' : spot.count >= 4 ? 'bg-amber-500' : 'bg-yellow-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {spot.label}
                    </p>
                    <p className="text-xs text-gray-400">{spot.count} incidents in cluster</p>
                  </div>
                  <Badge variant={spot.count >= 10 ? 'danger' : spot.count >= 4 ? 'warning' : 'default'}>
                    {spot.count >= 10 ? 'HIGH' : spot.count >= 4 ? 'MED' : 'LOW'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
