import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, MapPin, Brain, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import type { Incident } from '../../types';
import { ChatModal } from '../../components/ChatModal';

interface MyIncidentsPageProps {
  onNavigate?: (page: string) => void;
}

const statusVariant = (s: string): 'success' | 'warning' | 'info' => {
  if (s === 'resolved') return 'success';
  if (s === 'in_progress') return 'warning';
  return 'info';
};

const statusLabel = (s: string) => {
  if (s === 'resolved') return 'Resolved';
  if (s === 'in_progress') return 'In Progress';
  return 'Received';
};

const severityLabel = (score: number) => {
  if (score >= 80) return { label: 'Critical', cls: 'text-red-600' };
  if (score >= 60) return { label: 'High', cls: 'text-amber-600' };
  if (score >= 40) return { label: 'Medium', cls: 'text-yellow-600' };
  return { label: 'Low', cls: 'text-green-600' };
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function MyIncidentsPage({ onNavigate: _onNavigate }: MyIncidentsPageProps) {
  const { user } = useAuth();
  const { incidents, getIncidentMessages, sendMessage } = useApp();
  const [chatIncident, setChatIncident] = useState<Incident | null>(null);
  const { id } = useParams();

  const myIncidents = incidents.filter(i => i.reporter_id === (user?.id ?? 99));

  useEffect(() => {
    if (id && incidents.length > 0) {
      const incident = incidents.find(i => i.id === Number(id));
      if (incident) {
        setChatIncident(incident);
      }
    }
  }, [id, incidents]);

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">My Reports</h2>
        <p className="text-sm text-gray-500 mb-5">Track the status of your submitted incident reports.</p>

        {myIncidents.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reports yet</p>
              <p className="text-xs mt-1">Submit your first incident report to track it here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myIncidents.map(inc => {
              const sv = severityLabel(inc.ai_severity_score);
              const msgs = getIncidentMessages(inc.id);
              return (
                <Card key={inc.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Header row */}
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{inc.category}</span>
                          <Badge variant={statusVariant(inc.status)}>{statusLabel(inc.status)}</Badge>

                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-500 line-clamp-2">{inc.description}</p>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            GPS attached
                          </span>
                          <span className="flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            <span className={sv.cls + ' font-semibold'}>{sv.label}</span>
                            &nbsp;({inc.ai_severity_score}/100)
                          </span>
                          <span>{timeAgo(inc.created_at)}</span>
                        </div>

                        {/* Officer */}
                        {inc.assigned_officer && (
                          <p className="text-xs text-gray-500">
                            Assigned to: <span className="font-medium text-gray-700">{inc.assigned_officer}</span>
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <button
                          onClick={() => setChatIncident(inc)}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-700 hover:text-red-800 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Chat
                          {msgs.length > 0 && (
                            <span className="ml-1 bg-red-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                              {msgs.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {chatIncident && (
        <ChatModal
          incident={chatIncident}
          onClose={() => setChatIncident(null)}
          messages={getIncidentMessages(chatIncident.id)}
          onSend={(content) => sendMessage(chatIncident.id, user?.id ?? 99, user?.full_name ?? 'You', user?.role ?? 'standard_user', content)}
          currentUserId={user?.id ?? 99}
        />
      )}
    </div>
  );
}
