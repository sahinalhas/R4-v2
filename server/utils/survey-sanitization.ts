import { sanitizeString } from '../middleware/validation.js';

export interface SurveyQuestionOption {
  text?: string;
  value?: string;
  [key: string]: any;
}

export interface SurveyQuestionData {
  questionText?: string;
  helpText?: string;
  placeholder?: string;
  options?: SurveyQuestionOption[];
  [key: string]: any;
}

export function sanitizeQuestionData(question: SurveyQuestionData): SurveyQuestionData {
  const sanitized: SurveyQuestionData = { ...question };

  if (sanitized.questionText) {
    sanitized.questionText = sanitizeString(sanitized.questionText);
  }

  if (sanitized.helpText) {
    sanitized.helpText = sanitizeString(sanitized.helpText);
  }

  if (sanitized.placeholder) {
    sanitized.placeholder = sanitizeString(sanitized.placeholder);
  }

  if (sanitized.options && Array.isArray(sanitized.options)) {
    sanitized.options = sanitized.options.map(opt => ({
      ...opt,
      text: opt.text ? sanitizeString(opt.text) : opt.text,
      value: opt.value ? sanitizeString(opt.value) : opt.value
    }));
  }

  return sanitized;
}

export function sanitizeTemplateData(template: any): any {
  const sanitized = { ...template };

  if (sanitized.title) {
    sanitized.title = sanitizeString(sanitized.title);
  }

  if (sanitized.description) {
    sanitized.description = sanitizeString(sanitized.description);
  }

  if (sanitized.category) {
    sanitized.category = sanitizeString(sanitized.category);
  }

  if (sanitized.targetAudience) {
    sanitized.targetAudience = sanitizeString(sanitized.targetAudience);
  }

  return sanitized;
}
