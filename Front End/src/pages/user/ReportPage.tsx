import React, { useState } from 'react';
import { MapPin, Paperclip, Send, Brain, ChevronDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { INCIDENT_CATEGORIES } from '../../data/mockData';

interface ReportPageProps {
  onNavigate: (page: string) => void;
}

const severityColor = (score: number) => {
  if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
  if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-green-600 bg-green-50 border-green-200';
};

export function ReportPage({ onNavigate }: ReportPageProps) {
  const { user } = useAuth();
  const { addIncident } = useApp();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ category: string; score: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description.trim()) {
      setError('Please select a category and enter a description.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const incident = await addIncident({
        reporter_id: user?.id ?? 99,
        reporter_name: user?.full_name ?? 'Unknown',
        category,
        description,
        latitude: 8.6762 + (Math.random() - 0.5) * 0.005,
        longitude: 4.1680 + (Math.random() - 0.5) * 0.005,
      });

      setAiResult({
        category: incident.ai_category_suggestion,
        score: incident.ai_severity_score,
      });
      setSubmitted(true);
    } catch {
      setError('Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  if (submitted && aiResult) {
    return (
      <div className="min-h-screen bg-gray-50 pt-14">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
          <Card className="border-green-200">
            <CardContent className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Send className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Report Submitted</h3>
              <p className="text-sm text-gray-500">Your incident has been received and security has been notified.</p>
            </CardContent>
          </Card>

          {/* AI Result Panel */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">AI Analysis</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Category Identified</span>
                <Badge variant="info">{aiResult.category}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Severity Score</span>
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${severityColor(aiResult.score)}`}>
                  {aiResult.score}/100
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    aiResult.score >= 80 ? 'bg-red-500' :
                    aiResult.score >= 60 ? 'bg-amber-500' :
                    aiResult.score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${aiResult.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                AI-generated classification. You may contact security for corrections.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setSubmitted(false); setAiResult(null); setCategory(''); setDescription(''); }}>
              New Report
            </Button>
            <Button className="flex-1" onClick={() => onNavigate('my-incidents')}>
              View My Reports
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Report Incident</h2>
          <p className="text-sm text-gray-500">All reports are encrypted and sent to security immediately.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Incident Category</label>
            <button
              type="button"
              onClick={() => setCatOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 hover:border-red-300 transition"
            >
              <span className={category ? 'text-gray-900' : 'text-gray-400'}>{category || 'Select a category…'}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 max-h-52 overflow-y-auto">
                {INCIDENT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategory(cat); setCatOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-700 transition ${
                      category === cat ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Description</label>
            <textarea
              placeholder="Describe what happened in detail. Include time, location clues, and any identifying information…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* GPS indicator */}
          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
            <MapPin className="w-4 h-4" />
            GPS location will be automatically attached
          </div>

          {/* Attachment note */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Paperclip className="w-4 h-4" />
            Photo/video attachments supported on mobile
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-1">
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              <Send className="w-4 h-4" />
              {loading ? 'Analysing with AI…' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
