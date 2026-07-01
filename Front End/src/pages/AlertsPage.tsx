import { Radio, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import type { Alert } from '../types';

export function AlertsPage() {
  const { alerts } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Emergency Alerts
        </h2>
        <p className="text-sm text-gray-500 mb-5">Your submitted SOS alerts and their statuses.</p>

        {alerts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No emergency alerts sent yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {[...alerts].reverse().map((a: Alert) => (
            <div
              key={a.id}
              className={`bg-white border rounded-xl p-4 shadow-sm ${
                !a.resolved && !a.acknowledged ? 'border-red-300 bg-red-50/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{a.user_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {a.transmission_mode === 'mesh' ? (
                    <Badge variant="mesh">
                      <Radio className="w-3 h-3" /> Mesh
                    </Badge>
                  ) : (
                    <Badge variant="info">Online</Badge>
                  )}
                  {a.resolved ? (
                    <Badge variant="success">Resolved</Badge>
                  ) : a.acknowledged ? (
                    <Badge variant="warning">Acknowledged</Badge>
                  ) : (
                    <Badge variant="danger">Active</Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Location: {a.latitude.toFixed(6)}, {a.longitude.toFixed(6)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
