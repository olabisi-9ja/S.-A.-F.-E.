import { Incident } from '../types';

export function getCategoryData(incidents: Incident[]) {
  const counts: Record<string, number> = {};
  incidents.forEach(inc => {
    counts[inc.category] = (counts[inc.category] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getWeeklyTrend(incidents: Incident[], alerts: any[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trend = days.map(day => ({ day, incidents: 0, alerts: 0 }));

  incidents.forEach(inc => {
    const dayName = days[new Date(inc.created_at).getDay()];
    const dayObj = trend.find(t => t.day === dayName);
    if (dayObj) dayObj.incidents++;
  });

  alerts.forEach(alert => {
    const dayName = days[new Date(alert.created_at).getDay()];
    const dayObj = trend.find(t => t.day === dayName);
    if (dayObj) dayObj.alerts++;
  });

  // Reorder so today is last, or leave as Sun-Sat
  return trend;
}
