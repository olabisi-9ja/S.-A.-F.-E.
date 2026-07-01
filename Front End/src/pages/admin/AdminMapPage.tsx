import { MapPin, Radio, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_HOTSPOTS } from '../../data/mockData';

export function AdminMapPage() {
  const { incidents, alerts } = useApp();

  const activeAlerts = alerts.filter(a => !a.resolved);
  void incidents; // available for future use

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-700" />
            Campus Map — Live View
          </h2>
          <p className="text-sm text-gray-500">Real-time incident markers and AI predictive heatmap overlay.</p>
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

              {/* DBSCAN Hotspot Circles */}
              <circle cx="268" cy="290" r="42" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" />
              <circle cx="268" cy="290" r="22" fill="#8b5cf6" opacity="0.12" />
              <text x="268" y="340" textAnchor="middle" fontSize="8" fill="#7c3aed" fontWeight="600">Hotspot A</text>

              <circle cx="610" cy="290" r="38" fill="#8b5cf6" opacity="0.12" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" />
              <circle cx="610" cy="290" r="19" fill="#8b5cf6" opacity="0.10" />
              <text x="610" y="337" textAnchor="middle" fontSize="8" fill="#7c3aed" fontWeight="600">Hotspot B</text>

              <circle cx="490" cy="60" r="32" fill="#8b5cf6" opacity="0.10" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" />

              {/* Incident markers */}
              {/* Library theft */}
              <circle cx="268" cy="285" r="8" fill="#dc2626" stroke="white" strokeWidth="2" />
              <text x="268" y="289" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">!</text>
              <text x="268" y="260" textAnchor="middle" fontSize="8" fill="#dc2626" fontWeight="600">#1 Theft</text>

              {/* Female hostel harassment */}
              <circle cx="610" cy="283" r="8" fill="#dc2626" stroke="white" strokeWidth="2" />
              <text x="610" y="287" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">!</text>
              <text x="610" y="258" textAnchor="middle" fontSize="8" fill="#dc2626" fontWeight="600">#2 Harassment</text>

              {/* ICT vandalism (resolved) */}
              <circle cx="290" cy="100" r="8" fill="#16a34a" stroke="white" strokeWidth="2" />
              <text x="290" y="104" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">✓</text>

              {/* Admin suspicious */}
              <circle cx="490" cy="95" r="8" fill="#dc2626" stroke="white" strokeWidth="2" />
              <text x="490" y="99" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">!</text>

              {/* Student union assault */}
              <circle cx="258" cy="415" r="8" fill="#d97706" stroke="white" strokeWidth="2" />
              <text x="258" y="419" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">!</text>
              <text x="258" y="384" textAnchor="middle" fontSize="8" fill="#d97706" fontWeight="600">#5 Assault</text>

              {/* Alert markers */}
              <circle cx="610" cy="295" r="12" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="3,2" />
              <circle cx="610" cy="295" r="5" fill="#f97316" />

              <circle cx="268" cy="295" r="12" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="3,2" opacity="0.7" />

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
              {MOCK_HOTSPOTS.map((spot, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    spot.count >= 10 ? 'bg-red-500' : spot.count >= 7 ? 'bg-amber-500' : 'bg-yellow-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {['Library Area', 'Female Hostel', 'Faculty Block C'][i]}
                    </p>
                    <p className="text-xs text-gray-400">{spot.count} incidents in cluster</p>
                  </div>
                  <Badge variant={spot.count >= 10 ? 'danger' : spot.count >= 7 ? 'warning' : 'default'}>
                    {spot.count >= 10 ? 'HIGH' : spot.count >= 7 ? 'MED' : 'LOW'}
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
