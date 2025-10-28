/**
 * Bulk AI Analysis Routes
 */

import { Router } from 'express';
import { BulkAIAnalysisService } from '../services/bulk-ai-analysis.service.js';

const router = Router();
const bulkAnalysisService = new BulkAIAnalysisService();

/**
 * GET /api/bulk-analysis/classes
 * Sınıflar arası karşılaştırmalı analiz
 */
router.get('/classes', async (req, res) => {
  try {
    const analysis = await bulkAnalysisService.compareClasses();

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Class comparison error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Sınıf karşılaştırması başarısız'
    });
  }
});

/**
 * GET /api/bulk-analysis/school-wide
 * Okul geneli analiz
 */
router.get('/school-wide', async (req, res) => {
  try {
    const analysis = await bulkAnalysisService.analyzeSchoolWide();

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('School-wide analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Okul geneli analiz başarısız'
    });
  }
});

/**
 * GET /api/bulk-analysis/early-warning
 * Erken uyarı sistemi raporu
 */
router.get('/early-warning', async (req, res) => {
  try {
    const report = await bulkAnalysisService.generateEarlyWarningReport();

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    console.error('Early warning report error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erken uyarı raporu oluşturulamadı'
    });
  }
});

/**
 * GET /api/bulk-analysis/trends/:timeRange
 * Trend analizi
 */
router.get('/trends/:timeRange', async (req, res) => {
  try {
    const { timeRange } = req.params;
    
    if (!['week', 'month', 'semester'].includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz zaman aralığı'
      });
    }

    const analysis = await bulkAnalysisService.analyzeTrends(
      timeRange as 'week' | 'month' | 'semester'
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Trend analizi başarısız'
    });
  }
});

export default router;
