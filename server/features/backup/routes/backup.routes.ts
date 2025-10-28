/**
 * Backup and Security Routes
 * Yedekleme ve Güvenlik Rotaları
 */

import { Router } from 'express';
import { backupService } from '../services/backup.service';
import { auditService } from '../services/audit.service';
import { encryptionService } from '../services/encryption.service';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../../../middleware/auth.middleware.js';

const router = Router();

router.post('/create', requireAuth, requireRole(['admin', 'counselor']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { type = 'manual', options = {} } = req.body;
    
    const backup = await backupService.createBackup(authReq.user!.id, type, options);
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'CREATE_BACKUP',
      resource: 'backup',
      resourceId: backup.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    
    res.json(backup);
  } catch (error) {
    console.error('Create backup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create backup';
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/list', requireAuth, async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    console.error('List backups error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to list backups';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/restore/:backupId', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { backupId } = req.params;
    
    await backupService.restoreBackup(backupId);
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'RESTORE_BACKUP',
      resource: 'backup',
      resourceId: backupId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    
    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (error) {
    console.error('Restore backup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to restore backup';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete('/:backupId', requireAuth, requireRole(['admin', 'counselor']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { backupId } = req.params;
    
    await backupService.deleteBackup(backupId);
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'DELETE_BACKUP',
      resource: 'backup',
      resourceId: backupId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    
    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Delete backup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete backup';
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/audit-logs', requireAuth, requireRole(['admin', 'counselor']), async (req, res) => {
  try {
    const { userId, action, resource, startDate, endDate, limit } = req.query;
    
    const logs = await auditService.queryLogs({
      userId: userId as string,
      action: action as string,
      resource: resource as string,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string) : 100,
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Query audit logs error:', error);
    res.status(500).json({ error: 'Failed to query audit logs' });
  }
});

router.get('/audit-report/:userId', requireAuth, requireRole(['admin', 'counselor']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const report = await auditService.getAccessReport(userId, parseInt(days as string));
    res.json(report);
  } catch (error) {
    console.error('Get audit report error:', error);
    res.status(500).json({ error: 'Failed to get audit report' });
  }
});

router.post('/encrypt', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { data, fields } = req.body;
    
    if (!data || !fields) {
      return res.status(400).json({ error: 'data and fields are required' });
    }
    
    const encrypted = encryptionService.encryptSensitiveFields(data, fields);
    res.json(encrypted);
  } catch (error) {
    console.error('Encrypt error:', error);
    res.status(500).json({ error: 'Failed to encrypt data' });
  }
});

router.post('/decrypt', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { data, fields } = req.body;
    
    if (!data || !fields) {
      return res.status(400).json({ error: 'data and fields are required' });
    }
    
    const decrypted = encryptionService.decryptSensitiveFields(data, fields);
    res.json(decrypted);
  } catch (error) {
    console.error('Decrypt error:', error);
    res.status(500).json({ error: 'Failed to decrypt data' });
  }
});

router.post('/anonymize', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    const result: any = {};
    
    if (email) {
      result.email = encryptionService.anonymizeEmail(email);
    }
    
    if (phone) {
      result.phone = encryptionService.anonymizePhone(phone);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Anonymize error:', error);
    res.status(500).json({ error: 'Failed to anonymize data' });
  }
});

export default router;
