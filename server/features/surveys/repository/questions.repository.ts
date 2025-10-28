import getDatabase from '../../../lib/database.js';
import type { SurveyQuestion } from '../types/surveys.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getQuestionsByTemplate: db.prepare('SELECT * FROM survey_questions WHERE templateId = ? ORDER BY orderIndex'),
    insertSurveyQuestion: db.prepare(`
      INSERT INTO survey_questions (id, templateId, questionText, questionType, required, orderIndex, options, validation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateSurveyQuestion: db.prepare(`
      UPDATE survey_questions SET questionText = ?, questionType = ?, required = ?, orderIndex = ?, options = ?, validation = ?
      WHERE id = ?
    `),
    deleteSurveyQuestion: db.prepare('DELETE FROM survey_questions WHERE id = ?'),
    deleteQuestionsByTemplate: db.prepare('DELETE FROM survey_questions WHERE templateId = ?'),
  };
  
  isInitialized = true;
}

export function getQuestionsByTemplate(templateId: string): SurveyQuestion[] {
  try {
    ensureInitialized();
    const questions = statements.getQuestionsByTemplate.all(templateId) as any[];
    return questions.map(question => ({
      ...question,
      options: question.options ? JSON.parse(question.options) : null,
      validation: question.validation ? JSON.parse(question.validation) : null
    }));
  } catch (error) {
    console.error('Error getting questions by template:', error);
    return [];
  }
}

export function saveSurveyQuestion(question: any): void {
  try {
    ensureInitialized();
    statements.insertSurveyQuestion.run(
      question.id,
      question.templateId,
      question.questionText,
      question.questionType,
      (question.required || false) ? 1 : 0,
      question.orderIndex || 0,
      question.options ? JSON.stringify(question.options) : null,
      question.validation ? JSON.stringify(question.validation) : null
    );
  } catch (error) {
    console.error('Error saving survey question:', error);
    throw error;
  }
}

export function updateSurveyQuestion(id: string, question: any): void {
  try {
    ensureInitialized();
    statements.updateSurveyQuestion.run(
      question.questionText,
      question.questionType,
      (question.required || false) ? 1 : 0,
      question.orderIndex || 0,
      question.options ? JSON.stringify(question.options) : null,
      question.validation ? JSON.stringify(question.validation) : null,
      id
    );
  } catch (error) {
    console.error('Error updating survey question:', error);
    throw error;
  }
}

export function deleteSurveyQuestion(id: string): void {
  try {
    ensureInitialized();
    statements.deleteSurveyQuestion.run(id);
  } catch (error) {
    console.error('Error deleting survey question:', error);
    throw error;
  }
}

export function deleteQuestionsByTemplate(templateId: string): void {
  try {
    ensureInitialized();
    statements.deleteQuestionsByTemplate.run(templateId);
  } catch (error) {
    console.error('Error deleting questions by template:', error);
    throw error;
  }
}
