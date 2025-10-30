import getDatabase from '../../../lib/database.js';
import { MappingRulesRepository, UpdateQueueRepository } from '../repository/index.js';
import { randomUUID } from 'crypto';
import { sanitizeString } from '../../../middleware/validation.js';
import type { 
  ProfileMappingRule,
  ProfileUpdateQueue,
  MappingConfig,
  SelfAssessmentQuestion
} from '../../../../shared/types/self-assessment.types.js';

let mappingRulesRepo: MappingRulesRepository | null = null;
let updateQueueRepo: UpdateQueueRepository | null = null;

function getMappingRulesRepository(): MappingRulesRepository {
  if (!mappingRulesRepo) {
    const db = getDatabase();
    mappingRulesRepo = new MappingRulesRepository(db);
  }
  return mappingRulesRepo;
}

function getUpdateQueueRepository(): UpdateQueueRepository {
  if (!updateQueueRepo) {
    const db = getDatabase();
    updateQueueRepo = new UpdateQueueRepository(db);
  }
  return updateQueueRepo;
}

export function createMappingRule(
  rule: Omit<ProfileMappingRule, 'created_at'>
): ProfileMappingRule {
  const repo = getMappingRulesRepository();
  return repo.create(rule);
}

export function getMappingRulesByQuestion(questionId: string): ProfileMappingRule[] {
  const sanitizedId = sanitizeString(questionId);
  const repo = getMappingRulesRepository();
  return repo.findByQuestionId(sanitizedId);
}

export function processMapping(
  question: SelfAssessmentQuestion,
  answer: any,
  studentId: string,
  assessmentId: string
): ProfileUpdateQueue[] {
  if (!question.mappingConfig) {
    return [];
  }

  const suggestions: ProfileUpdateQueue[] = [];
  const config = question.mappingConfig;

  switch (config.strategy) {
    case 'DIRECT':
      suggestions.push(...processDirect(config, answer, studentId, assessmentId, question));
      break;
    case 'AI_STANDARDIZE':
      suggestions.push(...processAIStandardize(config, answer, studentId, assessmentId, question));
      break;
    case 'SCALE_CONVERT':
      suggestions.push(...processScaleConvert(config, answer, studentId, assessmentId, question));
      break;
    case 'ARRAY_MERGE':
      suggestions.push(...processArrayMerge(config, answer, studentId, assessmentId, question));
      break;
    case 'MULTIPLE_FIELDS':
      suggestions.push(...processMultipleFields(config, answer, studentId, assessmentId, question));
      break;
  }

  return suggestions;
}

function processDirect(
  config: MappingConfig,
  answer: any,
  studentId: string,
  assessmentId: string,
  question: SelfAssessmentQuestion
): ProfileUpdateQueue[] {
  if (!config.targetTable || !config.targetField) {
    return [];
  }

  let proposedValue: string;

  if (config.transformType === 'ARRAY') {
    proposedValue = JSON.stringify(Array.isArray(answer) ? answer : [answer]);
  } else if (config.transformType === 'NUMBER') {
    proposedValue = String(Number(answer));
  } else if (config.transformType === 'BOOLEAN') {
    proposedValue = String(Boolean(answer));
  } else {
    proposedValue = String(answer);
  }

  const queueRepo = getUpdateQueueRepository();
  const update: Omit<ProfileUpdateQueue, 'created_at'> = {
    id: randomUUID(),
    studentId,
    assessmentId,
    updateType: 'SELF_ASSESSMENT',
    targetTable: config.targetTable,
    targetField: config.targetField,
    proposedValue,
    reasoning: `Öğrenci anketi: ${question.questionText}`,
    confidence: 1.0,
    dataSource: question.id,
    status: question.requiresApproval ? 'PENDING' : 'AUTO_APPLIED'
  };

  return [queueRepo.create(update)];
}

function processAIStandardize(
  config: MappingConfig,
  answer: any,
  studentId: string,
  assessmentId: string,
  question: SelfAssessmentQuestion
): ProfileUpdateQueue[] {
  if (!config.targetTable || !config.targetField) {
    return [];
  }

  let standardizedValue: any = answer;

  if (config.standardValues && Array.isArray(config.standardValues)) {
    if (Array.isArray(answer)) {
      standardizedValue = answer.filter(val => 
        config.standardValues!.includes(val)
      );
    } else if (typeof answer === 'string') {
      const found = config.standardValues.find(std => 
        std.toLowerCase() === answer.toLowerCase()
      );
      standardizedValue = found || answer;
    }
  }

  const queueRepo = getUpdateQueueRepository();
  const update: Omit<ProfileUpdateQueue, 'created_at'> = {
    id: randomUUID(),
    studentId,
    assessmentId,
    updateType: 'SELF_ASSESSMENT',
    targetTable: config.targetTable,
    targetField: config.targetField,
    proposedValue: JSON.stringify(standardizedValue),
    reasoning: `Öğrenci anketi (AI standartlaştırma): ${question.questionText}`,
    confidence: 0.9,
    dataSource: question.id,
    status: question.requiresApproval ? 'PENDING' : 'AUTO_APPLIED'
  };

  return [queueRepo.create(update)];
}

function processScaleConvert(
  config: MappingConfig,
  answer: any,
  studentId: string,
  assessmentId: string,
  question: SelfAssessmentQuestion
): ProfileUpdateQueue[] {
  if (!config.targetTable || !config.targetField) {
    return [];
  }

  let convertedValue: number = Number(answer);

  if (config.sourceScale && config.targetScale) {
    const sourceRange = config.sourceScale.max - config.sourceScale.min;
    const targetRange = config.targetScale.max - config.targetScale.min;
    const normalized = (convertedValue - config.sourceScale.min) / sourceRange;
    convertedValue = config.targetScale.min + (normalized * targetRange);
    convertedValue = Math.round(convertedValue * 10) / 10;
  } else if (config.mapping) {
    const key = String(answer);
    convertedValue = config.mapping[key] !== undefined ? config.mapping[key] : answer;
  }

  const queueRepo = getUpdateQueueRepository();
  const update: Omit<ProfileUpdateQueue, 'created_at'> = {
    id: randomUUID(),
    studentId,
    assessmentId,
    updateType: 'SELF_ASSESSMENT',
    targetTable: config.targetTable,
    targetField: config.targetField,
    proposedValue: String(convertedValue),
    reasoning: `Öğrenci anketi (ölçek dönüşümü): ${question.questionText}`,
    confidence: 1.0,
    dataSource: question.id,
    status: question.requiresApproval ? 'PENDING' : 'AUTO_APPLIED'
  };

  return [queueRepo.create(update)];
}

function processArrayMerge(
  config: MappingConfig,
  answer: any,
  studentId: string,
  assessmentId: string,
  question: SelfAssessmentQuestion
): ProfileUpdateQueue[] {
  if (!config.targetTable || !config.targetField) {
    return [];
  }

  let arrayValue: string[];

  if (Array.isArray(answer)) {
    arrayValue = answer;
  } else if (typeof answer === 'string') {
    const separator = config.separator || ',';
    arrayValue = answer.split(separator).map(s => s.trim()).filter(s => s.length > 0);
  } else {
    arrayValue = [String(answer)];
  }

  const queueRepo = getUpdateQueueRepository();
  const update: Omit<ProfileUpdateQueue, 'created_at'> = {
    id: randomUUID(),
    studentId,
    assessmentId,
    updateType: 'SELF_ASSESSMENT',
    targetTable: config.targetTable,
    targetField: config.targetField,
    proposedValue: JSON.stringify(arrayValue),
    reasoning: `Öğrenci anketi (array birleştirme): ${question.questionText}`,
    confidence: 1.0,
    dataSource: question.id,
    status: question.requiresApproval ? 'PENDING' : 'AUTO_APPLIED'
  };

  return [queueRepo.create(update)];
}

function processMultipleFields(
  config: MappingConfig,
  answer: any,
  studentId: string,
  assessmentId: string,
  question: SelfAssessmentQuestion
): ProfileUpdateQueue[] {
  if (!config.mappings || config.mappings.length === 0) {
    return [];
  }

  const suggestions: ProfileUpdateQueue[] = [];
  const queueRepo = getUpdateQueueRepository();

  for (const mapping of config.mappings) {
    const targetField = mapping.field;
    let value: any = answer;

    if (mapping.extractFrom === 'full_text') {
      value = answer;
    }

    const update: Omit<ProfileUpdateQueue, 'created_at'> = {
      id: randomUUID(),
      studentId,
      assessmentId,
      updateType: 'SELF_ASSESSMENT',
      targetTable: config.targetTable || 'students',
      targetField,
      proposedValue: typeof value === 'string' ? value : JSON.stringify(value),
      reasoning: `Öğrenci anketi (çoklu alan): ${question.questionText}`,
      confidence: mapping.parseWithAI ? 0.85 : 1.0,
      dataSource: question.id,
      status: question.requiresApproval ? 'PENDING' : 'AUTO_APPLIED'
    };

    suggestions.push(queueRepo.create(update));
  }

  return suggestions;
}

export function getMappingRuleById(ruleId: string): ProfileMappingRule | null {
  const sanitizedId = sanitizeString(ruleId);
  const repo = getMappingRulesRepository();
  return repo.findById(sanitizedId);
}

export function updateMappingRule(
  ruleId: string,
  data: Partial<ProfileMappingRule>
): ProfileMappingRule {
  const sanitizedId = sanitizeString(ruleId);
  const repo = getMappingRulesRepository();
  return repo.update(sanitizedId, data);
}

export function deleteMappingRule(ruleId: string): boolean {
  const sanitizedId = sanitizeString(ruleId);
  const repo = getMappingRulesRepository();
  return repo.delete(sanitizedId);
}
