/**
 * Parent Communication Routes
 */

import { Router } from 'express';
import { ParentCommunicationAIService } from '../services/parent-communication-ai.service.js';

const router = Router();
const parentCommService = new ParentCommunicationAIService();

/**
 * POST /api/parent-communication/development-report/:studentId
 * Öğrenci için gelişim raporu oluştur
 */
router.post('/development-report/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const report = await parentCommService.generateDevelopmentReport(studentId);

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    console.error('Development report error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gelişim raporu oluşturulamadı'
    });
  }
});

/**
 * POST /api/parent-communication/message/:studentId
 * Veli mesajı oluştur
 */
router.post('/message/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { messageType, specificContent } = req.body;

    const message = await parentCommService.generateParentMessage(
      studentId,
      messageType,
      specificContent
    );

    res.json({
      success: true,
      data: message
    });
  } catch (error: any) {
    console.error('Parent message error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Veli mesajı oluşturulamadı'
    });
  }
});

/**
 * POST /api/parent-communication/meeting-invitation/:studentId
 * Toplantı daveti oluştur
 */
router.post('/meeting-invitation/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { meetingPurpose, suggestedDates } = req.body;

    const invitation = await parentCommService.generateMeetingInvitation(
      studentId,
      meetingPurpose,
      suggestedDates || []
    );

    res.json({
      success: true,
      data: invitation
    });
  } catch (error: any) {
    console.error('Meeting invitation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Toplantı daveti oluşturulamadı'
    });
  }
});

/**
 * POST /api/parent-communication/achievement/:studentId
 * Başarı bildirimi oluştur
 */
router.post('/achievement/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { achievement } = req.body;

    const message = await parentCommService.generateAchievementMessage(
      studentId,
      achievement
    );

    res.json({
      success: true,
      data: message
    });
  } catch (error: any) {
    console.error('Achievement message error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Başarı mesajı oluşturulamadı'
    });
  }
});

/**
 * POST /api/parent-communication/concern/:studentId
 * Endişe bildirimi oluştur
 */
router.post('/concern/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { concernArea, details } = req.body;

    const message = await parentCommService.generateConcernMessage(
      studentId,
      concernArea,
      details
    );

    res.json({
      success: true,
      data: message
    });
  } catch (error: any) {
    console.error('Concern message error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Endişe mesajı oluşturulamadı'
    });
  }
});

export default router;
