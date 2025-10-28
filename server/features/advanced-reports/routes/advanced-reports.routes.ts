/**
 * Advanced Reports Routes
 * Gelişmiş Raporlama API Endpoint'leri
 */

import { Router, Request, Response } from 'express';
import { advancedReportsService } from '../services/advanced-reports.service.js';
import { exportService } from '../services/export.service.js';
import { simpleRateLimit } from '../../../middleware/validation.js';

const router = Router();

/**
 * GET /api/advanced-reports/school-stats
 * Okul geneli istatistikleri getir
 */
router.get('/school-stats', simpleRateLimit(100, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const stats = await advancedReportsService.getSchoolStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching school statistics:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

/**
 * GET /api/advanced-reports/class-comparisons
 * Sınıf karşılaştırmalarını getir
 */
router.get('/class-comparisons', simpleRateLimit(100, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { classes } = req.query;
    const classNames = classes ? (classes as string).split(',') : undefined;
    
    const comparisons = await advancedReportsService.getClassComparisons(classNames);
    res.json(comparisons);
  } catch (error) {
    console.error('Error fetching class comparisons:', error);
    res.status(500).json({ error: 'Sınıf karşılaştırmaları alınamadı' });
  }
});

/**
 * GET /api/advanced-reports/compare/:class1/:class2
 * İki sınıfı karşılaştır
 */
router.get('/compare/:class1/:class2', simpleRateLimit(100, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { class1, class2 } = req.params;
    const comparison = await advancedReportsService.compareClasses(
      decodeURIComponent(class1),
      decodeURIComponent(class2)
    );
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing classes:', error);
    res.status(500).json({ error: 'Sınıflar karşılaştırılamadı' });
  }
});

/**
 * GET /api/advanced-reports/trends
 * Trend analizi getir
 */
router.get('/trends', simpleRateLimit(100, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    const validPeriods = ['daily', 'weekly', 'monthly'];
    const selectedPeriod = validPeriods.includes(period as string) 
      ? (period as 'daily' | 'weekly' | 'monthly')
      : 'monthly';
    
    const analysis = await advancedReportsService.getTrendAnalysis(
      selectedPeriod,
      startDate as string,
      endDate as string
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching trend analysis:', error);
    res.status(500).json({ error: 'Trend analizi alınamadı' });
  }
});

/**
 * POST /api/advanced-reports/comprehensive
 * Kapsamlı rapor oluştur
 */
router.post('/comprehensive', simpleRateLimit(20, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { generatedBy, includeAIAnalysis, classNames, period, startDate, endDate } = req.body;
    
    if (!generatedBy) {
      return res.status(400).json({ error: 'generatedBy alanı gereklidir' });
    }
    
    const report = await advancedReportsService.generateComprehensiveReport(generatedBy, {
      includeAIAnalysis,
      classNames,
      period,
      startDate,
      endDate,
    });
    
    res.json(report);
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    res.status(500).json({ error: 'Kapsamlı rapor oluşturulamadı' });
  }
});

/**
 * GET /api/advanced-reports/available-classes
 * Kullanılabilir sınıf listesini getir
 */
router.get('/available-classes', simpleRateLimit(100, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const classes = advancedReportsService.getAvailableClasses();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching available classes:', error);
    res.status(500).json({ error: 'Sınıf listesi alınamadı' });
  }
});

/**
 * POST /api/advanced-reports/export/excel
 * Excel rapor export
 */
router.post('/export/excel', simpleRateLimit(20, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { generatedBy, includeAIAnalysis, classNames, period, startDate, endDate, anonymize } = req.body;
    
    if (!generatedBy) {
      return res.status(400).json({ error: 'generatedBy alanı gereklidir' });
    }
    
    const report = await advancedReportsService.generateComprehensiveReport(generatedBy, {
      includeAIAnalysis,
      classNames,
      period,
      startDate,
      endDate,
    });
    
    const excelBase64 = exportService.exportToExcel(report, {
      format: 'excel',
      includeCharts: false,
      includeAIAnalysis: includeAIAnalysis || false,
      anonymize: anonymize || false,
    });
    
    res.json({
      success: true,
      reportId: report.reportId,
      filename: `okul_raporu_${new Date().toISOString().split('T')[0]}.xlsx`,
      data: excelBase64,
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Excel raporu oluşturulamadı' });
  }
});

export default router;
