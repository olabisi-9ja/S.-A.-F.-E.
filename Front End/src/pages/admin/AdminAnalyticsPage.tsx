import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Brain, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { CHART_DATA_WEEKLY, CHART_DATA_CATEGORY, MOCK_HOTSPOTS } from '../../data/mockData';

const PIE_COLORS = ['#b91c1c', '#d97706', '#2563eb', '#16a34a', '#7c3aed', '#6b7280'];

export function AdminAnalyticsPage() {
  const { incidents } = useApp();

  const categoryCount = CHART_DATA_CATEGORY;
  const totalIncidents = incidents.length;
  const avgSeverity = Math.round(incidents.reduce((s, i) => s + i.ai_severity_score, 0) / Math.max(incidents.length, 1));
  const critical = incidents.filter(i => i.ai_severity_score >= 80).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Analytics Panel
          </h2>
          <p className="text-sm text-gray-500">DBSCAN-powered predictive analysis and incident intelligence.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Incidents', value: totalIncidents, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Avg. AI Severity', value: `${avgSeverity}/100`, icon: Brain, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Critical (≥80)', value: critical, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Hotspot Zones', value: MOCK_HOTSPOTS.length, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Weekly trend */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800">Weekly Incident Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Incidents and alerts by day of week</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={CHART_DATA_WEEKLY} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" name="Incidents" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alerts" name="Alerts" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category distribution */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800">Category Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">AI-classified incident categories</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryCount}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryCount.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Severity over time */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800">AI Severity Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Average severity score over 7 days</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  { day: 'Mon', severity: 55 }, { day: 'Tue', severity: 72 },
                  { day: 'Wed', severity: 48 }, { day: 'Thu', severity: 81 },
                  { day: 'Fri', severity: 63 }, { day: 'Sat', severity: 76 },
                  { day: 'Sun', severity: 42 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="severity" stroke="#b91c1c" strokeWidth={2} dot={{ r: 4 }} name="Avg. Severity" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* DBSCAN Hotspots */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Predictive Hotspot Analysis
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">DBSCAN clustering — updated nightly</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_HOTSPOTS.map((spot, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    spot.count >= 10 ? 'bg-red-500' : spot.count >= 7 ? 'bg-amber-500' : 'bg-yellow-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">
                      Cluster {i + 1} — Zone {['Library Area', 'Female Hostel', 'Faculty Block C'][i]}
                    </p>
                    <p className="text-xs text-gray-400">{spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{spot.count}</p>
                    <p className="text-xs text-gray-400">incidents</p>
                  </div>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    spot.count >= 10 ? 'bg-red-100 text-red-700' : spot.count >= 7 ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {spot.count >= 10 ? 'HIGH' : spot.count >= 7 ? 'MED' : 'LOW'}
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center pt-2">
                Based on DBSCAN clustering of 30-day geo-tagged incident data. Hotspot = ≥3 incidents within 100m radius.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* UAT Results */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-800">User Acceptance Testing Results (n=50)</h3>
            <p className="text-xs text-gray-400 mt-0.5">30 students · 10 staff · 10 security personnel — 5-point Likert scale</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Reliability of Emergency Alert (online)', score: 4.6 },
                { label: 'Confidence in Mesh Fallback Delivery (offline)', score: 4.5 },
                { label: 'AI Hotspot Heatmap Usefulness (admin)', score: 4.6 },
                { label: 'Overall Satisfaction', score: 4.5 },
                { label: 'Ease of Incident Reporting', score: 4.4 },
                { label: 'Responsiveness of Communication Module', score: 4.3 },
                { label: 'Usefulness of AI Category/Severity Suggestion', score: 4.3 },
                { label: 'Clarity of Interface and Navigation', score: 4.2 },
              ].map(({ label, score }) => (
                <div key={label} className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 flex-1 min-w-0 truncate">{label}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-red-700 w-8">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
