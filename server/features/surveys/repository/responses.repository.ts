import getDatabase from '../../../lib/database.js';
import type { SurveyResponse } from '../types/surveys.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSurveyResponses: db.prepare('SELECT * FROM survey_responses ORDER BY created_at DESC'),
    getSurveyResponsesByDistribution: db.prepare('SELECT * FROM survey_responses WHERE distributionId = ? ORDER BY created_at DESC'),
    getSurveyResponsesByStudent: db.prepare('SELECT * FROM survey_responses WHERE studentId = ? ORDER BY created_at DESC'),
    getSurveyResponse: db.prepare('SELECT * FROM survey_responses WHERE id = ?'),
    insertSurveyResponse: db.prepare(`
      INSERT INTO survey_responses (id, distributionId, studentId, studentInfo, responseData, submissionType, 
                                   isComplete, submittedAt, ipAddress, userAgent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateSurveyResponse: db.prepare(`
      UPDATE survey_responses SET responseData = ?, isComplete = ?, submittedAt = ?
      WHERE id = ?
    `),
    deleteSurveyResponse: db.prepare('DELETE FROM survey_responses WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function loadSurveyResponses(filters?: { distributionId?: string; studentId?: string }): SurveyResponse[] {
  try {
    ensureInitialized();
    let responses: any[];
    
    if (filters?.distributionId) {
      responses = statements.getSurveyResponsesByDistribution.all(filters.distributionId) as any[];
    } else if (filters?.studentId) {
      responses = statements.getSurveyResponsesByStudent.all(filters.studentId) as any[];
    } else {
      responses = statements.getSurveyResponses.all() as any[];
    }
    
    return responses.map(response => ({
      ...response,
      responseData: response.responseData ? JSON.parse(response.responseData) : {},
      studentInfo: response.studentInfo ? JSON.parse(response.studentInfo) : null
    }));
  } catch (error) {
    console.error('Error loading survey responses:', error);
    return [];
  }
}

export function saveSurveyResponse(response: any): void {
  try {
    ensureInitialized();
    statements.insertSurveyResponse.run(
      response.id,
      response.distributionId,
      response.studentId || null,
      response.studentInfo ? JSON.stringify(response.studentInfo) : null,
      response.responseData ? JSON.stringify(response.responseData) : '{}',
      response.submissionType || 'ONLINE',
      (response.isComplete || false) ? 1 : 0,
      response.submittedAt || null,
      response.ipAddress || null,
      response.userAgent || null
    );
  } catch (error) {
    console.error('Error saving survey response:', error);
    throw error;
  }
}

export function updateSurveyResponse(id: string, response: any): void {
  try {
    ensureInitialized();
    statements.updateSurveyResponse.run(
      response.responseData ? JSON.stringify(response.responseData) : '{}',
      (response.isComplete || false) ? 1 : 0,
      response.submittedAt || null,
      id
    );
  } catch (error) {
    console.error('Error updating survey response:', error);
    throw error;
  }
}

export function deleteSurveyResponse(id: string): void {
  try {
    ensureInitialized();
    statements.deleteSurveyResponse.run(id);
  } catch (error) {
    console.error('Error deleting survey response:', error);
    throw error;
  }
}

export function bulkSaveSurveyResponses(responses: any[]): void {
  if (!responses || responses.length === 0) {
    return;
  }

  try {
    ensureInitialized();
    const db = getDatabase();
    
    const transaction = db.transaction(() => {
      for (const response of responses) {
        statements.insertSurveyResponse.run(
          response.id,
          response.distributionId,
          response.studentId || null,
          response.studentInfo ? JSON.stringify(response.studentInfo) : null,
          response.responseData ? JSON.stringify(response.responseData) : '{}',
          response.submissionType || 'ONLINE',
          (response.isComplete || false) ? 1 : 0,
          response.submittedAt || null,
          response.ipAddress || null,
          response.userAgent || null
        );
      }
    });
    
    transaction();
  } catch (error) {
    console.error('Error bulk saving survey responses:', error);
    throw error;
  }
}
