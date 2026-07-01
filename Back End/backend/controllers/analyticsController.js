import { Incident, Alert, User } from '../models/index.js';
import { Op, fn, col } from 'sequelize';
import { dateDiffSeconds, dateTrunc } from '../config/dialectHelpers.js';

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
    console.error('Get dashboard stats error:', error);
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
    console.error('Get hotspots error:', error);
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

    const trend = await Incident.findAll({
      where: { created_at: { [Op.gte]: daysAgo } },
      attributes: [
        [dateTrunc('created_at', groupBy), 'period'],
        [fn('COUNT', col('id')), 'incidents'],
        [fn('COUNT', col('id')), 'alerts'],
      ],
      group: [dateTrunc('created_at', groupBy)],
      order: [[dateTrunc('created_at', groupBy), 'ASC']],
      raw: true,
    });

    res.json({
      success: true,
      data: { trend },
    });
  } catch (error) {
    console.error('Get trend error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trend data.' 
    });
  }
};
