import express from 'express';
import { getDatabase } from '../../../lib/database/connection.js';

const router = express.Router();

router.post('/web-vitals', (req, res) => {
  try {
    const { name, value, rating, delta, id, navigationType } = req.body;

    if (!name || value === undefined) {
      return res.status(400).json({ 
        error: 'Metric name and value are required' 
      });
    }

    const db = getDatabase();
    const userAgent = req.headers['user-agent'] || 'unknown';

    db.prepare(`
      INSERT INTO web_vitals_metrics 
      (metric_name, value, rating, delta, metric_id, navigation_type, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      value,
      rating || null,
      delta || null,
      id || null,
      navigationType || null,
      userAgent
    );

    res.sendStatus(200);
  } catch (error) {
    console.error('Error recording web vitals metric:', error);
    res.status(500).json({ error: 'Failed to record metric' });
  }
});

router.get('/web-vitals/summary', (req, res) => {
  try {
    const db = getDatabase();
    const { days = 7 } = req.query;

    const summary = db.prepare(`
      SELECT 
        metric_name,
        COUNT(*) as count,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value,
        SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as good_percentage,
        SUM(CASE WHEN rating = 'needs-improvement' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as needs_improvement_percentage,
        SUM(CASE WHEN rating = 'poor' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as poor_percentage
      FROM web_vitals_metrics
      WHERE created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY metric_name
      ORDER BY metric_name
    `).all(days);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching web vitals summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
