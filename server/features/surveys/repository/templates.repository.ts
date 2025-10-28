import getDatabase from '../../../lib/database.js';
import type { SurveyTemplate } from '../types/surveys.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSurveyTemplates: db.prepare('SELECT * FROM survey_templates WHERE isActive = TRUE ORDER BY created_at DESC'),
    getSurveyTemplate: db.prepare('SELECT * FROM survey_templates WHERE id = ?'),
    insertSurveyTemplate: db.prepare(`
      INSERT INTO survey_templates (id, title, description, type, mebCompliant, isActive, createdBy, tags, estimatedDuration, targetGrades)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateSurveyTemplate: db.prepare(`
      UPDATE survey_templates SET title = ?, description = ?, type = ?, mebCompliant = ?, isActive = ?, 
                                 tags = ?, estimatedDuration = ?, targetGrades = ?
      WHERE id = ?
    `),
    deleteSurveyTemplate: db.prepare('UPDATE survey_templates SET isActive = FALSE WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function loadSurveyTemplates(): SurveyTemplate[] {
  try {
    ensureInitialized();
    const templates = statements.getSurveyTemplates.all() as (SurveyTemplate & { tags: string | null; targetGrades: string | null })[];
    return templates.map(template => ({
      ...template,
      tags: template.tags ? JSON.parse(template.tags) : [],
      targetGrades: template.targetGrades ? JSON.parse(template.targetGrades) : []
    }));
  } catch (error) {
    console.error('Error loading survey templates:', error);
    return [];
  }
}

export function getSurveyTemplate(id: string): SurveyTemplate | null {
  try {
    ensureInitialized();
    const template = statements.getSurveyTemplate.get(id) as (SurveyTemplate & { tags: string | null; targetGrades: string | null }) | undefined;
    if (!template) return null;
    
    return {
      ...template,
      tags: template.tags ? JSON.parse(template.tags) : [],
      targetGrades: template.targetGrades ? JSON.parse(template.targetGrades) : []
    };
  } catch (error) {
    console.error('Error getting survey template:', error);
    return null;
  }
}

export function saveSurveyTemplate(template: SurveyTemplate): void {
  try {
    ensureInitialized();
    statements.insertSurveyTemplate.run(
      template.id,
      template.title,
      template.description || null,
      template.type,
      (template.mebCompliant || false) ? 1 : 0,
      (template.isActive ?? true) ? 1 : 0,
      template.createdBy || null,
      template.tags ? JSON.stringify(template.tags) : null,
      template.estimatedDuration || null,
      template.targetGrades ? JSON.stringify(template.targetGrades) : null
    );
  } catch (error) {
    console.error('Error saving survey template:', error);
    throw error;
  }
}

export function updateSurveyTemplate(id: string, template: Partial<SurveyTemplate>): void {
  try {
    ensureInitialized();
    statements.updateSurveyTemplate.run(
      template.title,
      template.description || null,
      template.type,
      (template.mebCompliant || false) ? 1 : 0,
      (template.isActive ?? true) ? 1 : 0,
      template.tags ? JSON.stringify(template.tags) : null,
      template.estimatedDuration || null,
      template.targetGrades ? JSON.stringify(template.targetGrades) : null,
      id
    );
  } catch (error) {
    console.error('Error updating survey template:', error);
    throw error;
  }
}

export function deleteSurveyTemplate(id: string): void {
  try {
    ensureInitialized();
    statements.deleteSurveyTemplate.run(id);
  } catch (error) {
    console.error('Error deleting survey template:', error);
    throw error;
  }
}
