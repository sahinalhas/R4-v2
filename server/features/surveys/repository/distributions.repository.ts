import getDatabase from '../../../lib/database.js';
import type { SurveyDistribution } from '../types/surveys.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSurveyDistributions: db.prepare('SELECT * FROM survey_distributions ORDER BY created_at DESC'),
    getSurveyDistribution: db.prepare('SELECT * FROM survey_distributions WHERE id = ?'),
    getSurveyDistributionByLink: db.prepare('SELECT * FROM survey_distributions WHERE publicLink = ?'),
    insertSurveyDistribution: db.prepare(`
      INSERT INTO survey_distributions (id, templateId, title, description, targetClasses, targetStudents, 
                                       distributionType, excelTemplate, publicLink, startDate, endDate, 
                                       allowAnonymous, maxResponses, status, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateSurveyDistribution: db.prepare(`
      UPDATE survey_distributions SET title = ?, description = ?, targetClasses = ?, targetStudents = ?,
                                     distributionType = ?, startDate = ?, endDate = ?, allowAnonymous = ?,
                                     maxResponses = ?, status = ?
      WHERE id = ?
    `),
    deleteSurveyDistribution: db.prepare('DELETE FROM survey_distributions WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function loadSurveyDistributions(): SurveyDistribution[] {
  try {
    ensureInitialized();
    const distributions = statements.getSurveyDistributions.all() as any[];
    return distributions.map(distribution => ({
      ...distribution,
      targetClasses: distribution.targetClasses ? JSON.parse(distribution.targetClasses) : [],
      targetStudents: distribution.targetStudents ? JSON.parse(distribution.targetStudents) : []
    }));
  } catch (error) {
    console.error('Error loading survey distributions:', error);
    return [];
  }
}

export function getSurveyDistribution(id: string): SurveyDistribution | null {
  try {
    ensureInitialized();
    const distribution = statements.getSurveyDistribution.get(id) as any;
    if (!distribution) return null;
    
    return {
      ...distribution,
      targetClasses: distribution.targetClasses ? JSON.parse(distribution.targetClasses) : [],
      targetStudents: distribution.targetStudents ? JSON.parse(distribution.targetStudents) : []
    };
  } catch (error) {
    console.error('Error getting survey distribution:', error);
    return null;
  }
}

export function getSurveyDistributionByLink(publicLink: string): SurveyDistribution | null {
  try {
    ensureInitialized();
    const distribution = statements.getSurveyDistributionByLink.get(publicLink) as any;
    if (!distribution) return null;
    
    return {
      ...distribution,
      targetClasses: distribution.targetClasses ? JSON.parse(distribution.targetClasses) : [],
      targetStudents: distribution.targetStudents ? JSON.parse(distribution.targetStudents) : []
    };
  } catch (error) {
    console.error('Error getting survey distribution by link:', error);
    return null;
  }
}

export function saveSurveyDistribution(distribution: any): void {
  try {
    ensureInitialized();
    statements.insertSurveyDistribution.run(
      distribution.id,
      distribution.templateId,
      distribution.title,
      distribution.description || null,
      distribution.targetClasses ? JSON.stringify(distribution.targetClasses) : null,
      distribution.targetStudents ? JSON.stringify(distribution.targetStudents) : null,
      distribution.distributionType,
      distribution.excelTemplate || null,
      distribution.publicLink || null,
      distribution.startDate || null,
      distribution.endDate || null,
      (distribution.allowAnonymous || false) ? 1 : 0,
      distribution.maxResponses || null,
      distribution.status || 'DRAFT',
      distribution.createdBy || null
    );
  } catch (error) {
    console.error('Error saving survey distribution:', error);
    throw error;
  }
}

export function updateSurveyDistribution(id: string, distribution: any): void {
  try {
    ensureInitialized();
    statements.updateSurveyDistribution.run(
      distribution.title,
      distribution.description || null,
      distribution.targetClasses ? JSON.stringify(distribution.targetClasses) : null,
      distribution.targetStudents ? JSON.stringify(distribution.targetStudents) : null,
      distribution.distributionType,
      distribution.startDate || null,
      distribution.endDate || null,
      (distribution.allowAnonymous || false) ? 1 : 0,
      distribution.maxResponses || null,
      distribution.status || 'DRAFT',
      id
    );
  } catch (error) {
    console.error('Error updating survey distribution:', error);
    throw error;
  }
}

export function deleteSurveyDistribution(id: string): void {
  try {
    ensureInitialized();
    statements.deleteSurveyDistribution.run(id);
  } catch (error) {
    console.error('Error deleting survey distribution:', error);
    throw error;
  }
}
