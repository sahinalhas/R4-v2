import { RequestHandler } from 'express';
import * as templatesService from '../services/templates.service.js';
import { sanitizeObject } from '../../../middleware/validation.js';

export const getTemplates: RequestHandler = (req, res) => {
  try {
    const { isActive, category, grade } = req.query;
    
    const params: any = {};
    if (isActive !== undefined) params.isActive = isActive === 'true';
    if (category) params.category = category as string;
    if (grade) params.grade = grade as string;

    const templates = templatesService.getAllTemplates(params);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching self-assessment templates:', error);
    res.status(500).json({ error: 'Anket şablonları yüklenemedi' });
  }
};

export const getTemplateById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const template = templatesService.getTemplateById(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Anket şablonu bulunamadı' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching self-assessment template:', error);
    res.status(500).json({ error: 'Anket şablonu yüklenemedi' });
  }
};

export const getTemplateWithQuestions: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const template = templatesService.getTemplateWithQuestions(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Anket şablonu bulunamadı' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching self-assessment template with questions:', error);
    res.status(500).json({ error: 'Anket detayları yüklenemedi' });
  }
};

export const getActiveTemplatesForStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const { grade } = req.query;
    
    const templates = templatesService.getActiveTemplatesForStudent(
      studentId,
      grade as string | undefined
    );
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching active templates for student:', error);
    res.status(500).json({ error: 'Öğrenci anketleri yüklenemedi' });
  }
};

export const createTemplate: RequestHandler = (req, res) => {
  try {
    const templateData = sanitizeObject(req.body);
    
    if (!templateData.id || !templateData.title || !templateData.category) {
      return res.status(400).json({ 
        error: 'ID, başlık ve kategori alanları gereklidir' 
      });
    }

    const template = templatesService.createTemplate(templateData);
    res.json({ 
      success: true,
      template,
      message: 'Anket şablonu başarıyla oluşturuldu' 
    });
  } catch (error) {
    console.error('Error creating self-assessment template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Anket şablonu oluşturulamadı';
    res.status(500).json({ error: errorMessage });
  }
};

export const updateTemplate: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const templateData = sanitizeObject(req.body);
    
    const template = templatesService.updateTemplate(id, templateData);
    res.json({ 
      success: true,
      template,
      message: 'Anket şablonu başarıyla güncellendi' 
    });
  } catch (error) {
    console.error('Error updating self-assessment template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Anket şablonu güncellenemedi';
    res.status(500).json({ error: errorMessage });
  }
};

export const deleteTemplate: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const success = templatesService.deleteTemplate(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Anket şablonu bulunamadı' });
    }
    
    res.json({ 
      success: true,
      message: 'Anket şablonu başarıyla silindi' 
    });
  } catch (error) {
    console.error('Error deleting self-assessment template:', error);
    res.status(500).json({ error: 'Anket şablonu silinemedi' });
  }
};
