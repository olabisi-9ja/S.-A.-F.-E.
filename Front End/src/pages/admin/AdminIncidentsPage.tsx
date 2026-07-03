import { useState } from 'react';
import { Search, Filter, MessageSquare, MapPin, Brain, UserCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChatModal } from '../../components/ChatModal';
import type { Incident, IncidentStatus } from '../../types';

interface AdminIncidentsPageProps {
  onNavigate: (page: string) => void;
}

const STATUS_OPTIONS: IncidentStatus[] = ['received', 'in_progress', 'resolved'];
const OFFICERS = ['Inspector Musa Aliyu', 'Officer James Bello', 'Officer Aisha Umar', 'Sgt. Emmanuel Kuti'];

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

export function AdminIncidentsPage({ onNavigate: _onNavigate }: AdminIncidentsPageProps) {
  const { user } = useAuth();
  const { incidents, updateIncidentStatus, getIncidentMessages, sendMessage } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [chatIncident, setChatIncident] = useState<Incident | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const filtered = incidents
    .filter(i => filterStatus === 'all' || i.status === filterStatus)
    .filter(i =>
      search === '' ||
      (i.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.reporter_name || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div>
          <button onClick={() => _onNavigate('admin-dashboard')} className="inline-flex items-center gap-1 text-sm text-red-700 hover:bg-red-50 px-2 py-1 -ml-2 rounded-lg transition font-medium mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h2 className="text-xl font-bold text-gray-900">Incident Management</h2>
          <p className="text-sm text-gray-500">Review, assign, and close all reported incidents.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', ...STATUS_OPTIONS].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition capitalize whitespace-nowrap ${
                  filterStatus === s
                    ? 'bg-red-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
                }`}
              >
                {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-400">{filtered.length} incident{filtered.length !== 1 ? 's' : ''} found</p>

        {/* List */}
        <div className="space-y-3">
          {filtered.map(inc => (
            <Card key={inc.id}>
              <CardContent className="py-4">
                <div className="flex gap-3">
                  {/* Severity bar */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div className={`w-1.5 h-full min-h-[60px] rounded-full ${severityColor(inc.ai_severity_score)}`} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Row 1 */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">#{inc.id} — {inc.category}</span>
                      <Badge variant={inc.status === 'resolved' ? 'success' : inc.status === 'in_progress' ? 'warning' : 'info'}>
                        {inc.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="default">
                        <Brain className="w-3 h-3" /> {inc.ai_severity_score}/100
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">{inc.description}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>Reporter: <span className="text-gray-700 font-medium">{inc.reporter_name}</span></span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{Number(inc.latitude).toFixed(4)}, {Number(inc.longitude).toFixed(4)}</span>
                      <span>{timeAgo(inc.created_at)}</span>
                    </div>

                    {/* Officer assignment */}
                    {inc.assigned_officer && (
                      <p className="text-xs text-gray-500">
                        Assigned: <span className="font-medium text-gray-700">{inc.assigned_officer}</span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* Status change */}
                      {STATUS_OPTIONS.filter(s => s !== inc.status).map(s => (
                        <button
                          key={s}
                          onClick={() => updateIncidentStatus(inc.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition border ${
                            s === 'resolved'
                              ? 'border-green-300 text-green-700 hover:bg-green-50'
                              : s === 'in_progress'
                                ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Mark {s.replace('_', ' ')}
                        </button>
                      ))}

                      {/* Assign officer */}
                      <div className="relative">
                        <button
                          onClick={() => setAssigningId(assigningId === inc.id ? null : inc.id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium border border-blue-300 text-blue-700 hover:bg-blue-50 transition flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" /> Assign
                        </button>
                        {assigningId === inc.id && (
                          <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10 min-w-[180px]">
                            {OFFICERS.map(officer => (
                              <button
                                key={officer}
                                onClick={() => { updateIncidentStatus(inc.id, inc.status, officer); setAssigningId(null); }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-red-700 transition"
                              >
                                {officer}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Chat */}
                      <button
                        onClick={() => setChatIncident(inc)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium border border-red-300 text-red-700 hover:bg-red-50 transition flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Chat
                        {getIncidentMessages(inc.id).length > 0 && (
                          <span className="ml-0.5 bg-red-600 text-white rounded-full w-3.5 h-3.5 text-[10px] flex items-center justify-center">
                            {getIncidentMessages(inc.id).length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <Filter className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No incidents match your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {chatIncident && (
        <ChatModal
          incident={chatIncident}
          onClose={() => setChatIncident(null)}
          messages={getIncidentMessages(chatIncident.id)}
          onSend={(content) => sendMessage(chatIncident.id, user?.id ?? 2, user?.full_name ?? 'Security', user?.role ?? 'security_admin', content)}
          currentUserId={user?.id ?? 2}
        />
      )}
    </div>
  );
}
