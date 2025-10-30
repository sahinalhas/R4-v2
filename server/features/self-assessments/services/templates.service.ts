import getDatabase from '../../../lib/database.js';
import { SelfAssessmentTemplatesRepository } from '../repository/index.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { 
  SelfAssessmentTemplate, 
  TemplateWithQuestions,
  SelfAssessmentCategory 
} from '../../../../shared/types/self-assessment.types.js';

let templatesRepo: SelfAssessmentTemplatesRepository | null = null;

function getRepository(): SelfAssessmentTemplatesRepository {
  if (!templatesRepo) {
    const db = getDatabase();
    templatesRepo = new SelfAssessmentTemplatesRepository(db);
  }
  return templatesRepo;
}

export function getAllTemplates(params?: { 
  isActive?: boolean; 
  category?: SelfAssessmentCategory;
  grade?: string;
}): SelfAssessmentTemplate[] {
  const repo = getRepository();
  let templates = repo.findAll({
    isActive: params?.isActive,
    category: params?.category
  });

  if (params?.grade) {
    templates = templates.filter(template => {
      if (!template.targetGrades || template.targetGrades.length === 0) {
        return true;
      }
      return template.targetGrades.includes(params.grade!);
    });
  }

  return templates;
}

export function getTemplateById(id: string): SelfAssessmentTemplate | null {
  const sanitizedId = sanitizeString(id);
  const repo = getRepository();
  return repo.findById(sanitizedId);
}

export function getTemplateWithQuestions(id: string): TemplateWithQuestions | null {
  const sanitizedId = sanitizeString(id);
  const repo = getRepository();
  return repo.findByIdWithQuestions(sanitizedId);
}

export function createTemplate(
  template: Omit<SelfAssessmentTemplate, 'created_at' | 'updated_at'>
): SelfAssessmentTemplate {
  const sanitizedTemplate = {
    ...template,
    id: sanitizeString(template.id),
    title: sanitizeString(template.title),
    description: template.description ? sanitizeString(template.description) : undefined
  };

  const repo = getRepository();
  return repo.create(sanitizedTemplate);
}

export function updateTemplate(
  id: string, 
  data: Partial<SelfAssessmentTemplate>
): SelfAssessmentTemplate {
  const sanitizedId = sanitizeString(id);
  const sanitizedData = {
    ...data,
    title: data.title ? sanitizeString(data.title) : undefined,
    description: data.description ? sanitizeString(data.description) : undefined
  };

  const repo = getRepository();
  return repo.update(sanitizedId, sanitizedData);
}

export function deleteTemplate(id: string): boolean {
  const sanitizedId = sanitizeString(id);
  const repo = getRepository();
  return repo.delete(sanitizedId);
}

export function getActiveTemplatesForStudent(
  studentId: string,
  grade?: string
): SelfAssessmentTemplate[] {
  return getAllTemplates({ 
    isActive: true,
    grade 
  });
}
