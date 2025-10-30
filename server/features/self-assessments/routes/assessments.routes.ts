import { RequestHandler } from 'express';
import * as assessmentsService from '../services/assessments.service.js';
import * as mappingService from '../services/mapping.service.js';
import * as templatesService from '../services/templates.service.js';
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

export const startAssessment: RequestHandler = (req, res) => {
  try {
    const authReq = req as any as AuthenticatedRequest;
    const { templateId, studentId } = sanitizeObject(req.body);
    
    if (!templateId || !studentId) {
      return res.status(400).json({ 
        error: 'Şablon ID ve öğrenci ID gereklidir' 
      });
    }

    const template = templatesService.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Anket şablonu bulunamadı' });
    }

    if (!template.isActive) {
      return res.status(400).json({ error: 'Bu anket şu anda aktif değil' });
    }

    if (authReq.user && authReq.user.id !== studentId && !['COUNSELOR', 'ADMIN'].includes(authReq.user.role)) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const assessment = assessmentsService.startAssessment({ templateId, studentId });
    res.json({
      success: true,
      assessmentId: assessment.id,
      status: assessment.status
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Anket başlatılamadı';
    res.status(500).json({ error: errorMessage });
  }
};

export const saveDraft: RequestHandler = (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { responseData, completionPercentage } = sanitizeObject(req.body);
    
    if (!responseData || completionPercentage === undefined) {
      return res.status(400).json({ 
        error: 'Cevap verileri ve tamamlanma yüzdesi gereklidir' 
      });
    }

    const assessment = assessmentsService.saveDraft(assessmentId, {
      responseData,
      completionPercentage
    });

    res.json({
      success: true,
      savedAt: assessment.updated_at,
      completionPercentage: assessment.completionPercentage
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    const errorMessage = error instanceof Error ? error.message : 'Taslak kaydedilemedi';
    res.status(500).json({ error: errorMessage });
  }
};

export const submitAssessment: RequestHandler = (req, res) => {
  try {
    const authReq = req as any as AuthenticatedRequest;
    const { assessmentId } = req.params;
    const { responseData, parentConsentGiven } = sanitizeObject(req.body);
    
    if (!responseData) {
      return res.status(400).json({ error: 'Cevap verileri gereklidir' });
    }

    if (!authReq.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gereklidir' });
    }

    const assessment = assessmentsService.submitAssessment(
      assessmentId,
      { responseData, parentConsentGiven },
      authReq.user.id
    );

    const template = templatesService.getTemplateWithQuestions(assessment.templateId);
    if (template && template.questions) {
      for (const question of template.questions) {
        const answer = responseData[question.id];
        if (answer !== undefined && answer !== null) {
          const suggestions = mappingService.processMapping(
            question,
            answer,
            assessment.studentId,
            assessment.id
          );
          
          console.log(`Created ${suggestions.length} update suggestions for question ${question.id}`);
        }
      }
    }

    assessmentsService.updateAIProcessingStatus(assessmentId, 'COMPLETED');

    res.json({
      success: true,
      assessmentId: assessment.id,
      status: assessment.status,
      message: 'Anketiniz başarıyla gönderildi. Rehber öğretmeniniz inceledikten sonra profiliniz güncellenecektir.'
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Anket gönderilemedi';
    res.status(500).json({ error: errorMessage });
  }
};

export const getMyAssessments: RequestHandler = (req, res) => {
  try {
    const authReq = req as any as AuthenticatedRequest;
    const { studentId } = req.query;
    const { status } = req.query;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gereklidir' });
    }

    const targetStudentId = studentId as string || authReq.user.id;

    if (authReq.user.id !== targetStudentId && !['COUNSELOR', 'ADMIN'].includes(authReq.user.role)) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const assessments = assessmentsService.getStudentAssessments(
      targetStudentId,
      status as any
    );

    const enrichedAssessments = assessments.map(assessment => {
      const template = templatesService.getTemplateById(assessment.templateId);
      return {
        id: assessment.id,
        templateTitle: template?.title || 'Bilinmeyen',
        templateCategory: template?.category,
        status: assessment.status,
        completionPercentage: assessment.completionPercentage,
        submittedAt: assessment.submittedAt,
        reviewedAt: assessment.reviewedAt,
        created_at: assessment.created_at
      };
    });

    res.json({ assessments: enrichedAssessments });
  } catch (error) {
    console.error('Error fetching student assessments:', error);
    res.status(500).json({ error: 'Anketler yüklenemedi' });
  }
};

export const getAssessmentById: RequestHandler = (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = assessmentsService.getAssessmentById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Anket bulunamadı' });
    }

    const template = templatesService.getTemplateWithQuestions(assessment.templateId);
    
    res.json({
      ...assessment,
      template
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Anket yüklenemedi' });
  }
};

export const deleteAssessment: RequestHandler = (req, res) => {
  try {
    const { assessmentId } = req.params;
    const success = assessmentsService.deleteAssessment(assessmentId);
    
    if (!success) {
      return res.status(404).json({ error: 'Anket bulunamadı' });
    }

    res.json({
      success: true,
      message: 'Anket başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Anket silinemedi' });
  }
};
