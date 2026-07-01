import { AlertTriangle, FileText, CheckCircle, Clock, TrendingUp, Radio, Wifi } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const severityColor = (score: number) => {
  if (score >= 80) return 'bg-red-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-yellow-400';
  return 'bg-green-500';
};

const severityBadge = (score: number): 'danger' | 'warning' | 'success' | 'default' => {
  if (score >= 80) return 'danger';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'default';
  return 'success';
};

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { incidents, alerts, acknowledgeAlert, resolveAlert } = useApp();

  const totalIncidents = incidents.length;
  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;
  const inProgress = incidents.filter(i => i.status === 'in_progress').length;

  const recentIncidents = [...incidents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  const statCards = [
    { label: 'Total Incidents', value: totalIncidents, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Alerts', value: activeAlerts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resolved', value: resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Security Dashboard</h2>
            <p className="text-sm text-gray-500">Real-time incident monitoring — Kwara State University</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
              <Wifi className="w-3 h-3" /> Live
            </div>
            <div className="text-xs text-gray-400">{new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Active Alerts */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Active Alerts
              </h3>
              {unacknowledgedAlerts.length > 0 && (
                <Badge variant="danger">{unacknowledgedAlerts.length} new</Badge>
              )}
            </div>

            {alerts.filter(a => !a.resolved).length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-gray-400 text-sm">
                  No active alerts
                </CardContent>
              </Card>
            ) : (
              alerts.filter(a => !a.resolved).map(alert => (
                <Card key={alert.id} className={!alert.acknowledged ? 'border-red-300 bg-red-50/30' : ''}>
                  <CardContent className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{alert.user_name}</span>
                        {alert.transmission_mode === 'mesh' && <Badge variant="mesh"><Radio className="w-3 h-3" />Mesh</Badge>}
                      </div>
                      {!alert.acknowledged && <Badge variant="danger">New</Badge>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)} · {timeAgo(alert.created_at)}
                    </p>
                    <div className="flex gap-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        Resolve
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Recent Incidents */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Recent Incidents
              </h3>
              <button onClick={() => onNavigate('admin-incidents')} className="text-xs text-red-700 font-medium hover:underline">
                View all
              </button>
            </div>

            <div className="space-y-2">
              {recentIncidents.map(inc => (
                <Card key={inc.id} onClick={() => onNavigate('admin-incidents')}>
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      {/* Severity bar */}
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                        <div className={`w-1.5 h-12 rounded-full ${severityColor(inc.ai_severity_score)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">{inc.category}</span>
                          <Badge variant={inc.status === 'resolved' ? 'success' : inc.status === 'in_progress' ? 'warning' : 'info'}>
                            {inc.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{inc.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{inc.reporter_name} · {timeAgo(inc.created_at)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge variant={severityBadge(inc.ai_severity_score)}>
                          {inc.ai_severity_score}/100
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">AI Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Performance metrics */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-800">System Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Online Alert Latency', value: '1.8s', sub: 'avg.' },
                { label: 'Mesh Relay Latency', value: '4.2s', sub: '3-node' },
                { label: 'Alert Delivery Rate', value: '100%', sub: 'offline tests' },
                { label: 'UAT Mean Score', value: '4.5/5', sub: 'n=50' },
              ].map(m => (
                <div key={m.label} className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xl font-bold text-red-700">{m.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.sub}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
