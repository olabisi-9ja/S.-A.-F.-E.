import { useState } from 'react';
import { AlertTriangle, FileText, MessageSquare, Clock, Zap, Radio, CheckCircle, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const statusVariant = (s: string) => {
  if (s === 'resolved') return 'success';
  if (s === 'in_progress') return 'warning';
  return 'info';
};

const statusLabel = (s: string) => {
  if (s === 'resolved') return 'Resolved';
  if (s === 'in_progress') return 'In Progress';
  return 'Received';
};

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const { incidents, triggerAlert } = useApp();
  const [sosState, setSosState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [usedMesh, setUsedMesh] = useState(false);

  const myIncidents = incidents.filter(i => i.reporter_id === (user?.id ?? 99)).slice(0, 3);

  const handleSOS = async (startTracking = false) => {
    if (sosState !== 'idle') return;
    setSosState('sending');

    try {
      // Get real GPS location instantly
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      const mesh = !navigator.onLine; // Only use mesh if completely offline
      setUsedMesh(mesh);
      const alertId = await triggerAlert(latitude, longitude, mesh ? 'mesh' : 'https');
      setSosState('sent');
      
      // If Live Tracker was requested and an ID was returned, navigate to it
      if (startTracking && alertId) {
        onNavigate(`track/${alertId}`);
        return;
      }
    } catch (error) {
      // Fallback instantly if location fails
      console.warn('Geolocation failed, using fallback.', error);
      const mesh = !navigator.onLine;
      setUsedMesh(mesh);
      const alertId = await triggerAlert(8.6762, 4.1680, mesh ? 'mesh' : 'https'); // Default KWASU coordinates
      setSosState('sent');

      if (startTracking && alertId) {
        onNavigate(`track/${alertId}`);
        return;
      }
    }

    setTimeout(() => setSosState('idle'), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome, {user?.full_name.split(' ')[0]}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Stay safe. Stay alert.</p>
        </div>

        {/* SOS Button */}
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            {sosState === 'sending' && (
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40" />
            )}
            <button
              onClick={() => handleSOS(false)}
              disabled={sosState === 'sending'}
              className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-200 font-extrabold text-white select-none
                ${sosState === 'idle' ? 'bg-red-600 hover:bg-red-700 active:scale-95' : ''}
                ${sosState === 'sending' ? 'bg-red-500 scale-95 cursor-wait' : ''}
                ${sosState === 'sent' ? 'bg-green-600 scale-95' : ''}
              `}
            >
              {sosState === 'idle' && (
                <>
                  <AlertTriangle className="w-10 h-10 mb-1" />
                  <span className="text-3xl tracking-widest">SOS</span>
                </>
              )}
              {sosState === 'sending' && (
                <>
                  <Radio className="w-10 h-10 mb-1 animate-pulse" />
                  <span className="text-base">Sending…</span>
                </>
              )}
              {sosState === 'sent' && (
                <>
                  <CheckCircle className="w-10 h-10 mb-1" />
                  <span className="text-base">Sent!</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500 text-center max-w-xs">
            Press and hold in an emergency. Your GPS location will be transmitted to security personnel instantly.
          </p>

          {sosState === 'sent' && (
            <div className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              usedMesh ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
            }`}>
              {usedMesh ? (
                <><Radio className="w-4 h-4" /> Alert sent via Mesh Network</>
              ) : (
                <><Zap className="w-4 h-4" /> Alert sent — Security notified</>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('report')}
            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition text-gray-700 group"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition">
              <FileText className="w-6 h-6 text-red-700" />
            </div>
            <span className="text-sm font-semibold">Report Incident</span>
          </button>

          <button
            onClick={() => handleSOS(true)}
            disabled={sosState !== 'idle'}
            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition text-gray-700 group disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-center leading-tight">Live Track<br/>& Share</span>
          </button>

          <button
            onClick={() => onNavigate('my-incidents')}
            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition text-gray-700 group col-span-2 md:col-span-1"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-semibold">My Reports</span>
          </button>
        </div>

        {/* Recent reports */}
        {myIncidents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Recent Reports</h3>
              <button onClick={() => onNavigate('my-incidents')} className="text-xs text-red-700 font-medium hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {myIncidents.map(inc => (
                <Card key={inc.id} onClick={() => onNavigate('my-incidents')}>
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{inc.category}</span>
                          <Badge variant={statusVariant(inc.status) as 'success' | 'warning' | 'info'}>
                            {statusLabel(inc.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{inc.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs text-gray-400">
                          {new Date(inc.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); onNavigate('chat/' + inc.id); }}
                          className="flex items-center gap-1 text-xs text-red-700 hover:underline font-medium"
                        >
                          <MessageSquare className="w-3 h-3" /> Chat
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {myIncidents.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No reports yet. Stay safe!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
