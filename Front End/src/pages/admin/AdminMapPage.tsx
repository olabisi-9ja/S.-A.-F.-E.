import { MapPin, Radio, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getRealHotspots } from '../../utils/mapUtils';

// Helper to project live lat/lng coordinates to the 800x500 SVG map
const projectCoords = (lat: number, lng: number) => {
  // Base coordinate is roughly KWASU center (8.6762, 4.1680) mapped to SVG (400, 250)
  const x = 400 + (lng - 4.1680) * 160000;
  const y = 250 - (lat - 8.6762) * 100000; // SVG y is inverted
  return { cx: Math.max(20, Math.min(780, x)), cy: Math.max(20, Math.min(480, y)) };
};

export function AdminMapPage() {
  const { incidents, alerts } = useApp();

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

        {/* SVG Map */}
        <Card className="overflow-hidden">
          <div className="relative bg-[#e8f4e8] rounded-xl overflow-hidden" style={{ height: '500px' }}>
            {/* Campus map background */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 500"
              className="absolute inset-0"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background */}
              <rect width="800" height="500" fill="#f0f7f0" />

              {/* Roads */}
              <rect x="180" y="0" width="20" height="500" fill="#d4c9a8" opacity="0.7" rx="2" />
              <rect x="0" y="220" width="800" height="18" fill="#d4c9a8" opacity="0.7" rx="2" />
              <rect x="400" y="0" width="16" height="500" fill="#d4c9a8" opacity="0.6" rx="2" />
              <rect x="0" y="360" width="800" height="14" fill="#d4c9a8" opacity="0.5" rx="2" />

              {/* Campus buildings */}
              <rect x="210" y="60" width="140" height="80" rx="6" fill="#c8d8c8" stroke="#a0b8a0" strokeWidth="1.5" />
              <text x="280" y="106" textAnchor="middle" fontSize="9" fill="#4a6a4a" fontWeight="600">Faculty of ICT</text>

              <rect x="420" y="60" width="120" height="70" rx="6" fill="#c8d8c8" stroke="#a0b8a0" strokeWidth="1.5" />
              <text x="480" y="100" textAnchor="middle" fontSize="9" fill="#4a6a4a" fontWeight="600">Admin Block</text>

              <rect x="210" y="260" width="100" height="65" rx="6" fill="#c8d8c8" stroke="#a0b8a0" strokeWidth="1.5" />
              <text x="260" y="296" textAnchor="middle" fontSize="9" fill="#4a6a4a" fontWeight="600">Library</text>

              <rect x="560" y="260" width="120" height="65" rx="6" fill="#c8d8c8" stroke="#a0b8a0" strokeWidth="1.5" />
              <text x="620" y="296" textAnchor="middle" fontSize="9" fill="#4a6a4a" fontWeight="600">Female Hostel</text>

              <rect x="210" y="390" width="100" height="55" rx="6" fill="#c8d8c8" stroke="#a0b8a0" strokeWidth="1.5" />
              <text x="260" y="421" textAnchor="middle" fontSize="9" fill="#4a6a4a" fontWeight="600">Student Union</text>

              <rect x="420" y="390" width="100" height="55" rx="6" fill="#c8d8c8" stroke="#a0b8a0" strokeWidth="1.5" />
              <text x="470" y="421" textAnchor="middle" fontSize="9" fill="#4a6a4a" fontWeight="600">Cafeteria</text>

              <rect x="580" y="390" width="100" height="55" rx="6" fill="#b8d0b8" stroke="#90a890" strokeWidth="1.5" />
              <text x="630" y="418" textAnchor="middle" fontSize="9" fill="#4a6a4a" fontWeight="600">Security</text>
              <text x="630" y="431" textAnchor="middle" fontSize="9" fill="#4a6a4a" fontWeight="600">Post</text>

              {/* Green areas */}
              <ellipse cx="600" cy="130" rx="60" ry="40" fill="#a8c8a8" opacity="0.5" />
              <text x="600" y="134" textAnchor="middle" fontSize="9" fill="#5a8a5a">Central Park</text>

              {/* Dynamic DBSCAN Hotspot Circles */}
              {realHotspots.map((spot, i) => {
                const { cx, cy } = projectCoords(spot.latitude, spot.longitude);
                // Radius based on count
                const rOuter = Math.min(60, 25 + spot.count * 3);
                const rInner = Math.min(30, 10 + spot.count * 1.5);
                return (
                  <g key={`hotspot-${i}`}>
                    <circle cx={cx} cy={cy} r={rOuter} fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" />
                    <circle cx={cx} cy={cy} r={rInner} fill="#8b5cf6" opacity="0.12" />
                    <text x={cx} y={cy + rOuter + 8} textAnchor="middle" fontSize="8" fill="#7c3aed" fontWeight="600">{spot.label}</text>
                  </g>
                );
              })}

              {/* Dynamic Incident markers */}
              {incidents.filter(i => i.status !== 'resolved').map(inc => {
                if (!inc.latitude || !inc.longitude) return null;
                const { cx, cy } = projectCoords(inc.latitude, inc.longitude);
                const isProgress = inc.status === 'in_progress';
                const color = isProgress ? '#d97706' : '#dc2626'; // amber or red
                return (
                  <g key={`inc-${inc.id}`}>
                    <circle cx={cx} cy={cy} r="8" fill={color} stroke="white" strokeWidth="2" />
                    <text x={cx} y={cy + 3} textAnchor="middle" fontSize="8" fill="white" fontWeight="700">!</text>
                    <text x={cx} y={cy - 12} textAnchor="middle" fontSize="8" fill={color} fontWeight="600">#{inc.id} {inc.category}</text>
                  </g>
                );
              })}

              {/* Dynamic Alert markers */}
              {activeAlerts.map(alert => {
                if (!alert.latitude || !alert.longitude) return null;
                const { cx, cy } = projectCoords(alert.latitude, alert.longitude);
                return (
                  <g key={`alert-${alert.id}`}>
                    <circle cx={cx} cy={cy} r="14" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="3,2" />
                    <circle cx={cx} cy={cy} r="6" fill="#f97316" />
                    <text x={cx} y={cy - 18} textAnchor="middle" fontSize="9" fill="#f97316" fontWeight="bold">SOS</text>
                  </g>
                );
              })}

              {/* Compass */}
              <text x="750" y="30" textAnchor="middle" fontSize="16" fill="#4a6a4a" fontWeight="bold">N</text>
              <line x1="750" y1="35" x2="750" y2="55" stroke="#4a6a4a" strokeWidth="2" />
              <polygon points="750,35 745,50 750,45 755,50" fill="#4a6a4a" />
            </svg>

            {/* Map label */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow">
              Kwara State University, Malete Campus
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
                    <p className="text-xs text-gray-400">{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</p>
                  </div>
                  {alert.transmission_mode === 'mesh' && (
                    <Badge variant="mesh"><Radio className="w-3 h-3" />Mesh</Badge>
                  )}
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
