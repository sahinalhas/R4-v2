import * as repository from '../../repository/index.js';
import { sanitizeQuestionData } from '../../../../utils/survey-sanitization.js';

export function getTemplateQuestions(templateId: string) {
  return repository.getQuestionsByTemplate(templateId);
}

export function createQuestion(question: any) {
  const sanitizedQuestion = sanitizeQuestionData(question);
  repository.saveSurveyQuestion(sanitizedQuestion);
}

export function updateQuestion(id: string, question: any) {
  const sanitizedQuestion = sanitizeQuestionData(question);
  repository.updateSurveyQuestion(id, sanitizedQuestion);
}

export function deleteQuestion(id: string) {
  repository.deleteSurveyQuestion(id);
}

export function deleteTemplateQuestions(templateId: string) {
  repository.deleteQuestionsByTemplate(templateId);
}
