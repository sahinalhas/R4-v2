import { Router } from 'express';
import { NotificationEngineService } from '../services/notification-engine.service.js';
import { NotificationRulesService } from '../services/notification-rules.service.js';
import * as repository from '../repository/notifications.repository.js';

const router = Router();
const notificationEngine = new NotificationEngineService();
const notificationRules = new NotificationRulesService();

router.post('/send', async (req, res) => {
  try {
    const result = await notificationEngine.sendNotification(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-bulk', async (req, res) => {
  try {
    const { notifications } = req.body;
    const result = await notificationEngine.sendBulkNotifications(notifications);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-templated', async (req, res) => {
  try {
    const { templateName, recipientContact, recipientType, variables, options } = req.body;
    const result = await notificationEngine.sendTemplatedNotification(
      templateName,
      recipientContact,
      recipientType,
      variables,
      options
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const notifications = repository.getNotificationsByStudent(studentId);
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const notifications = await notificationEngine.getPendingNotifications();
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const { status, limit } = req.query;
    const notifications = repository.getNotificationsByStatus(
      status as any,
      limit ? Number(limit) : undefined
    );
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { dateFrom } = req.query;
    const stats = await notificationEngine.getNotificationStats(dateFrom as string);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/retry-failed', async (req, res) => {
  try {
    const retried = await notificationEngine.retryFailedNotifications();
    res.json({ success: true, data: { retried } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    repository.updateNotificationStatus(id, status, additionalData);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/alert-notification', async (req, res) => {
  try {
    const { alert } = req.body;
    await notificationRules.processAlertNotifications(alert);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/intervention-notification', async (req, res) => {
  try {
    const { interventionId, studentId, interventionTitle, startDate } = req.body;
    await notificationRules.processInterventionNotifications(
      interventionId,
      studentId,
      interventionTitle,
      startDate
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/weekly-digest/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { progressSummary } = req.body;
    await notificationRules.sendWeeklyDigest(studentId, progressSummary);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/meeting-invitation', async (req, res) => {
  try {
    const { studentId, meetingDate, meetingTime, meetingTopic } = req.body;
    await notificationRules.scheduleMeetingInvitation(
      studentId,
      meetingDate,
      meetingTime,
      meetingTopic
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;
    const prefs = repository.getPreferenceByUser(userId, userType as string);
    res.json({ success: true, data: prefs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/preferences', async (req, res) => {
  try {
    const id = repository.createOrUpdatePreference(req.body);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const { category } = req.query;
    const templates = repository.getAllTemplates(category as string);
    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = repository.getTemplateById(id);
    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/parent-access', async (req, res) => {
  try {
    const id = repository.createParentAccessToken(req.body);
    const token = repository.getTokensByStudent(req.body.studentId).find(t => t.id === id);
    res.json({ success: true, data: token });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/parent-access/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const accessToken = repository.getTokenByValue(token);
    
    if (!accessToken || !accessToken.isActive) {
      return res.status(404).json({ success: false, error: 'Invalid or expired token' });
    }

    repository.updateTokenAccess(token);
    res.json({ success: true, data: accessToken });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/parent-access/:id', async (req, res) => {
  try {
    const { id } = req.params;
    repository.revokeToken(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/parent-access/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const tokens = repository.getTokensByStudent(studentId);
    res.json({ success: true, data: tokens });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
