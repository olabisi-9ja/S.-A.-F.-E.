import { Incident, Alert, User } from '../models/index.js';
import { Op, fn, col } from 'sequelize';
import { dateDiffSeconds, dateTrunc } from '../config/dialectHelpers.js';
import logger from '../utils/logger.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const rawApiKey = process.env.GEMINI_API_KEY || 'dummy_key_if_not_provided';
const ai = new GoogleGenAI({
  apiKey: rawApiKey.replace(/^"|"$/g, '')
});

export const getDashboardStats = async (req, res) => {
  try {
    // Only admins can access full stats
    if (req.userRole === 'standard_user') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied.' 
      });
    }

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Total counts
    const totalIncidents = await Incident.count();
    const totalAlerts = await Alert.count();
    const totalUsers = await User.count();

    // Today's stats
    const todayIncidents = await Incident.count({ where: { created_at: { [Op.gte]: today } } });
    const todayAlerts = await Alert.count({ where: { created_at: { [Op.gte]: today } } });

    // Status breakdown
    const receivedCount = await Incident.count({ where: { status: 'received' } });
    const inProgressCount = await Incident.count({ where: { status: 'in_progress' } });
    const resolvedCount = await Incident.count({ where: { status: 'resolved' } });

    // Active alerts
    const activeAlerts = await Alert.count({ where: { resolved: false } });
    const unacknowledgedAlerts = await Alert.count({ where: { acknowledged: false, resolved: false } });

    // Average response time (time from incident creation to first status change)
    const avgResponseTime = await Incident.findOne({
      where: { status: { [Op.ne]: 'received' } },
      attributes: [
        [fn('AVG', dateDiffSeconds('created_at', 'updated_at')), 'avg_seconds'],
      ],
    });

    // Weekly trend
    const weeklyTrend = await Incident.findAll({
      where: { created_at: { [Op.gte]: weekAgo } },
      attributes: [
        [dateTrunc('created_at', 'day'), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [dateTrunc('created_at', 'day')],
      order: [[dateTrunc('created_at', 'day'), 'ASC']],
      raw: true,
    });

    // Category breakdown
    const categoryBreakdown = await Incident.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['category'],
      raw: true,
    });

    // Severity distribution
    const criticalCount = await Incident.count({ where: { ai_severity_score: { [Op.gte]: 80 } } });
    const highCount = await Incident.count({ 
      where: { ai_severity_score: { [Op.gte]: 60, [Op.lt]: 80 } } 
    });
    const mediumCount = await Incident.count({ 
      where: { ai_severity_score: { [Op.gte]: 40, [Op.lt]: 60 } } 
    });
    const lowCount = await Incident.count({ where: { ai_severity_score: { [Op.lt]: 40 } } });

    res.json({
      success: true,
      data: {
        overview: {
          totalIncidents,
          totalAlerts,
          totalUsers,
          todayIncidents,
          todayAlerts,
        },
        statusBreakdown: {
          received: receivedCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
        },
        alerts: {
          active: activeAlerts,
          unacknowledged: unacknowledgedAlerts,
        },
        severity: {
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount,
        },
        performance: {
          avgResponseTimeSeconds: Math.round(avgResponseTime?.dataValues?.avg_seconds || 0),
        },
        trends: {
          weekly: weeklyTrend,
          categories: categoryBreakdown,
        },
      },
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics.' 
    });
  }
};

export const getHotspots = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // Get all incidents with location data
    const incidents = await Incident.findAll({
      where: {
        created_at: { [Op.gte]: daysAgo },
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
      },
      attributes: ['latitude', 'longitude'],
      raw: true,
    });

    if (incidents.length < 3) {
      return res.json({
        success: true,
        data: { hotspots: [], message: 'Insufficient data for clustering' },
      });
    }

    // Simple clustering algorithm (DBSCAN simulation)
    const coords = incidents.map(i => ({
      lat: parseFloat(i.latitude),
      lng: parseFloat(i.longitude),
    }));

    // Group nearby points (simplified clustering)
    const clusters = [];
    const visited = new Set();
    const eps = 0.001; // ~100m radius

    for (let i = 0; i < coords.length; i++) {
      if (visited.has(i)) continue;

      const cluster = [i];
      visited.add(i);

      for (let j = i + 1; j < coords.length; j++) {
        if (visited.has(j)) continue;

        const dist = Math.sqrt(
          Math.pow(coords[i].lat - coords[j].lat, 2) +
          Math.pow(coords[i].lng - coords[j].lng, 2)
        );

        if (dist < eps) {
          cluster.push(j);
          visited.add(j);
        }
      }

      if (cluster.length >= 3) {
        // Calculate centroid
        const centroid = {
          lat: cluster.reduce((sum, idx) => sum + coords[idx].lat, 0) / cluster.length,
          lng: cluster.reduce((sum, idx) => sum + coords[idx].lng, 0) / cluster.length,
          count: cluster.length,
        };
        clusters.push(centroid);
      }
    }

    res.json({
      success: true,
      data: {
        hotspots: clusters.map((c, i) => ({
          cluster: i,
          lat: c.lat,
          lng: c.lng,
          count: c.count,
        })),
        totalIncidents: incidents.length,
        period: `${days} days`,
      },
    });
  } catch (error) {
    logger.error('Get hotspots error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate hotspot data.' 
    });
  }
};

export const getIncidentTrend = async (req, res) => {
  try {
    const { period = '7', groupBy = 'day' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const incidentTrend = await Incident.findAll({
      where: { created_at: { [Op.gte]: daysAgo } },
      attributes: [
        [dateTrunc('created_at', groupBy), 'period'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [dateTrunc('created_at', groupBy)],
      raw: true,
    });

    const alertTrend = await Alert.findAll({
      where: { created_at: { [Op.gte]: daysAgo } },
      attributes: [
        [dateTrunc('created_at', groupBy), 'period'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [dateTrunc('created_at', groupBy)],
      raw: true,
    });

    const trendMap = new Map();
    incidentTrend.forEach(t => {
      trendMap.set(t.period, { period: t.period, incidents: parseInt(t.count), alerts: 0 });
    });
    alertTrend.forEach(t => {
      if (trendMap.has(t.period)) {
        trendMap.get(t.period).alerts = parseInt(t.count);
      } else {
        trendMap.set(t.period, { period: t.period, incidents: 0, alerts: parseInt(t.count) });
      }
    });

    const trend = Array.from(trendMap.values()).sort((a, b) => new Date(a.period) - new Date(b.period));

    res.json({
      success: true,
      data: { trend },
    });
  } catch (error) {
    logger.error('Get trend error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trend data.' 
    });
  }
};

export const getAIBriefing = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder') {
      return res.status(503).json({ 
        success: false, 
        error: 'AI Security Briefing is currently unavailable (GEMINI_API_KEY not configured).' 
      });
    }

    const now = new Date();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentIncidents = await Incident.findAll({
      where: { created_at: { [Op.gte]: weekAgo } },
      attributes: ['category', 'description', 'ai_severity_score', 'created_at', 'status'],
      raw: true
    });

    const recentAlerts = await Alert.findAll({
      where: { created_at: { [Op.gte]: weekAgo } },
      attributes: ['id', 'latitude', 'longitude', 'resolved', 'created_at'],
      raw: true
    });

    const incidentsSummary = recentIncidents.map(inc => 
      `- [${new Date(inc.created_at).toLocaleDateString()}] ${inc.category} (Severity: ${inc.ai_severity_score}, Status: ${inc.status}): ${inc.description}`
    ).join('\n');

    const alertsSummary = recentAlerts.map(alt => 
      `- [${new Date(alt.created_at).toLocaleDateString()}] Emergency SOS at (${alt.latitude || 'unknown'}, ${alt.longitude || 'unknown'}) - Resolved: ${alt.resolved}`
    ).join('\n');

    const systemPrompt = `You are a professional Security Analyst assistant for S.A.F.E. (Smart Alert and Field Emergency) campus safety application at KWASU.
Analyze the following safety data from the last 7 days and generate a concise, executive safety briefing.

Data Summary:
Recent Incidents (Last 7 Days):
${incidentsSummary || 'None reported.'}

Recent Emergency SOS Alerts (Last 7 Days):
${alertsSummary || 'None triggered.'}

Structure your briefing in clean HTML format with the following sections (use clear headings like <h3>, bullet points, and strong tags):
1. **Weekly Overview**: A high-level summary of security activity.
2. **Key Security Trends**: Identify any patterns (e.g., specific locations, times, repeating categories).
3. **Response & Resolution Review**: Summary of resolved vs unresolved items.
4. **Actionable Security Recommendations**: Suggested interventions (e.g., increase patrol at X, host safety webinar for Y).
5. **Overall Campus Safety Index**: Suggest a rating (e.g., "Good", "Moderate Risk", etc.) with brief reasoning.

Keep the tone professional, direct, and security-focused. Format output in clean, plain HTML. Do not include markdown \`\`\`html tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ]
    });

    res.json({
      success: true,
      data: { briefing: response.text }
    });
  } catch (error) {
    logger.error('Get AI Briefing error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AI security briefing.' });
  }
};

export const getPredictiveRisk = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder') {
      return res.status(503).json({ 
        success: false, 
        error: 'Predictive risk modeling is currently unavailable (GEMINI_API_KEY not configured).' 
      });
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const historicalIncidents = await Incident.findAll({
      where: {
        created_at: { [Op.gte]: ninetyDaysAgo },
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
      },
      attributes: ['category', 'latitude', 'longitude', 'created_at', 'ai_severity_score'],
      raw: true
    });

    const historicalAlerts = await Alert.findAll({
      where: {
        created_at: { [Op.gte]: ninetyDaysAgo },
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
      },
      attributes: ['latitude', 'longitude', 'created_at'],
      raw: true
    });

    const incidentsData = historicalIncidents.map(inc => ({
      category: inc.category,
      lat: parseFloat(inc.latitude),
      lng: parseFloat(inc.longitude),
      time: new Date(inc.created_at).getHours(),
      day: new Date(inc.created_at).getDay(),
      severity: inc.ai_severity_score
    }));

    const alertsData = historicalAlerts.map(alt => ({
      lat: parseFloat(alt.latitude),
      lng: parseFloat(alt.longitude),
      time: new Date(alt.created_at).getHours(),
      day: new Date(alt.created_at).getDay()
    }));

    const dataString = JSON.stringify({ incidents: incidentsData, alerts: alertsData });

    const systemPrompt = `You are an advanced predictive safety AI model for S.A.F.E. KWASU campus application.
Analyze the following historical safety coordinates and times from the last 90 days. Detect spatial clusters (risk zones) and temporal clusters (vulnerable times).

Data:
${dataString}

Based on this data, predict the risk zones for the upcoming week.
Respond ONLY with a valid JSON object matching the format below. Do not include markdown backticks or explanations.

Format:
{
  "risk_zones": [
    {
      "name": "Location description (e.g. Near Engineering Lecture Theater, Female Hostel Area)",
      "lat": <approximate center latitude>,
      "lng": <approximate center longitude>,
      "risk_level": "one of: High, Medium, Low",
      "vulnerable_hours": "e.g., 6:00 PM - 10:00 PM",
      "primary_risk_category": "e.g., Theft, Harassment",
      "reasoning": "brief explanation of prediction based on historical clusters"
    }
  ],
  "top_safety_warnings": [
    "e.g., Increase patrols near the library after 9 PM due to clustered theft reports."
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ]
    });

    const parsed = JSON.parse(response.text.trim().replace(/```json|```/g, '').trim());

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    logger.error('Get predictive risk error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate predictive risk modeling.' });
  }
};
