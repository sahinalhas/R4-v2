import { RequestHandler } from 'express';
import * as approvalService from '../services/approval.service.js';
import { sanitizeObject } from '../../../middleware/validation.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    institution?: string;
  };
}

export const getPendingUpdates: RequestHandler = (req, res) => {
  try {
    const { studentId, category, sortBy } = req.query;
    
    const filter: any = {};
    if (studentId) filter.studentId = studentId as string;
    if (category) filter.category = category as string;
    if (sortBy) filter.sortBy = sortBy as string;

    const result = approvalService.getPendingUpdates(filter);
    res.json(result);
  } catch (error) {
    console.error('Error fetching pending updates:', error);
    res.status(500).json({ error: 'Bekleyen güncellemeler yüklenemedi' });
  }
};

export const getSuggestionsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const suggestions = approvalService.getSuggestionsByStudent(studentId);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching student suggestions:', error);
    res.status(500).json({ error: 'Öğrenci güncellemeleri yüklenemedi' });
  }
};

export const approveUpdate: RequestHandler = (req, res) => {
  try {
    const authReq = req as any as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gereklidir' });
    }

    const { updateIds, notes } = sanitizeObject(req.body);
    
    if (!updateIds || !Array.isArray(updateIds) || updateIds.length === 0) {
      return res.status(400).json({ 
        error: 'Güncelleme ID\'leri gereklidir' 
      });
    }

    const result = approvalService.approveUpdate(
      { updateIds, notes },
      authReq.user.id
    );

    res.json({
      success: result.success,
      appliedCount: result.appliedCount,
      updatedFields: result.updatedFields,
      message: `${result.appliedCount} güncelleme başarıyla uygulandı`
    });
  } catch (error) {
    console.error('Error approving updates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Güncellemeler onaylanamadı';
    res.status(500).json({ error: errorMessage });
  }
};

export const rejectUpdate: RequestHandler = (req, res) => {
  try {
    const authReq = req as any as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gereklidir' });
    }

    const { updateId, reason } = sanitizeObject(req.body);
    
    if (!updateId || !reason) {
      return res.status(400).json({ 
        error: 'Güncelleme ID ve red nedeni gereklidir' 
      });
    }

    const success = approvalService.rejectUpdate(
      { updateId, reason },
      authReq.user.id
    );

    res.json({
      success,
      message: 'Güncelleme başarıyla reddedildi'
    });
  } catch (error) {
    console.error('Error rejecting update:', error);
    const errorMessage = error instanceof Error ? error.message : 'Güncelleme reddedilemedi';
    res.status(500).json({ error: errorMessage });
  }
};

export const bulkApproveUpdates: RequestHandler = (req, res) => {
  try {
    const authReq = req as any as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gereklidir' });
    }

    const { studentId, assessmentId, excludeIds } = sanitizeObject(req.body);
    
    if (!studentId) {
      return res.status(400).json({ error: 'Öğrenci ID gereklidir' });
    }

    const result = approvalService.bulkApproveUpdates(
      { studentId, assessmentId, excludeIds },
      authReq.user.id
    );

    res.json({
      success: true,
      approvedCount: result.approvedCount,
      updatedFields: result.updatedFields,
      message: `${result.approvedCount} güncelleme toplu olarak onaylandı`
    });
  } catch (error) {
    console.error('Error bulk approving updates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Toplu onay başarısız oldu';
    res.status(500).json({ error: errorMessage });
  }
};

export const getUpdateById: RequestHandler = (req, res) => {
  try {
    const { updateId } = req.params;
    const update = approvalService.getUpdateById(updateId);
    
    if (!update) {
      return res.status(404).json({ error: 'Güncelleme bulunamadı' });
    }

    res.json(update);
  } catch (error) {
    console.error('Error fetching update:', error);
    res.status(500).json({ error: 'Güncelleme yüklenemedi' });
  }
};
