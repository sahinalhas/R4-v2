import { RequestHandler } from "express";
import multer from 'multer';
import * as surveyService from '../../services/surveys.service.js';
import { autoSyncHooks } from '../../../profile-sync/index.js';

// File upload configuration with validation
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Validate MIME type
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream' // Sometimes Excel files are sent as binary
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Also check file extension as fallback
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
      
      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Sadece Excel dosyaları (.xlsx, .xls) yüklenebilir'));
      }
    }
  }
});

export const getSurveyResponses: RequestHandler = (req, res) => {
  try {
    const { distributionId, studentId } = req.query;
    
    let responses;
    if (distributionId) {
      responses = surveyService.getResponses({ distributionId: distributionId as string });
    } else if (studentId) {
      responses = surveyService.getResponses({ studentId: studentId as string });
    } else {
      responses = surveyService.getResponses();
    }
    
    res.json(responses);
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    res.status(500).json({ success: false, error: 'Anket yanıtları yüklenemedi' });
  }
};

export const createSurveyResponse: RequestHandler = (req, res) => {
  try {
    const response = req.body;
    
    if (!response.distributionId || !response.responseData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dağıtım ID ve yanıt verisi gereklidir' 
      });
    }

    const distribution = surveyService.getDistributionById(response.distributionId);
    if (!distribution) {
      return res.status(404).json({ 
        success: false, 
        error: 'Anket dağıtımı bulunamadı' 
      });
    }

    const template = surveyService.getTemplateById(distribution.templateId);
    if (!template) {
      return res.status(404).json({ 
        success: false, 
        error: 'Anket şablonu bulunamadı' 
      });
    }

    const questions = surveyService.getTemplateQuestions(distribution.templateId);
    
    try {
      surveyService.validateResponseData(distribution, questions, response.responseData, response.studentInfo);
    } catch (error: any) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    surveyService.createResponse(response);
    
    // 🔥 OTOMATIK PROFİL SENKRONIZASYONU - Anket cevaplandığında profili güncelle
    autoSyncHooks.onSurveyResponseSubmitted({
      id: response.id || `response_${Date.now()}`,
      ...response
    }).catch(error => {
      console.error('Profile sync failed after survey response:', error);
    });
    
    res.json({ success: true, message: 'Anket yanıtı başarıyla kaydedildi' });
  } catch (error) {
    console.error('Error creating survey response:', error);
    res.status(500).json({ success: false, error: 'Anket yanıtı kaydedilemedi' });
  }
};

export const updateSurveyResponseHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const response = req.body;
    
    surveyService.updateResponse(id, response);
    res.json({ success: true, message: 'Anket yanıtı başarıyla güncellendi' });
  } catch (error) {
    console.error('Error updating survey response:', error);
    res.status(500).json({ success: false, error: 'Anket yanıtı güncellenemedi' });
  }
};

export const deleteSurveyResponseHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    surveyService.deleteResponse(id);
    res.json({ success: true, message: 'Anket yanıtı başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting survey response:', error);
    res.status(500).json({ success: false, error: 'Anket yanıtı silinemedi' });
  }
};

export const importExcelResponsesHandler: RequestHandler = async (req, res) => {
  try {
    const { distributionId } = req.params;
    
    if (!distributionId) {
      return res.status(400).json({
        success: false,
        error: 'Dağıtım ID gereklidir'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Excel dosyası yüklenmedi'
      });
    }

    // Additional file validation
    if (req.file.size === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dosya boş'
      });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Dosya boyutu 10MB\'dan büyük olamaz'
      });
    }

    const fileBuffer = req.file.buffer;
    const result = await surveyService.importSurveyResponsesFromExcel(distributionId, fileBuffer);

    if (result.success) {
      res.json({
        success: true,
        message: `${result.successCount} yanıt başarıyla yüklendi`,
        ...result
      });
    } else {
      res.status(400).json({
        success: false,
        message: `${result.successCount} yanıt yüklendi, ${result.errorCount} hata oluştu`,
        ...result
      });
    }
  } catch (error: any) {
    console.error('Error importing Excel responses:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Excel yükleme işlemi başarısız oldu'
    });
  }
};

export const uploadMiddleware = upload.single('file');
