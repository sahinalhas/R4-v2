import { AIProviderService } from '../../../services/ai-provider.service.js';
import type { 
  MappingConfig,
  SelfAssessmentQuestion,
  StudentSelfAssessment,
  ProfileUpdateQueue,
  ProcessingResult
} from '../../../../shared/types/self-assessment.types.js';
import { randomUUID } from 'crypto';
import { SelfAssessmentsRepository, UpdateQueueRepository } from '../repository/index.js';
import getDatabase from '../../../lib/database.js';
import { getTemplateWithQuestions } from './templates.service.js';

let assessmentsRepo: SelfAssessmentsRepository | null = null;
let updateQueueRepo: UpdateQueueRepository | null = null;

function getAssessmentsRepository(): SelfAssessmentsRepository {
  if (!assessmentsRepo) {
    const db = getDatabase();
    assessmentsRepo = new SelfAssessmentsRepository(db);
  }
  return assessmentsRepo;
}

function getUpdateQueueRepository(): UpdateQueueRepository {
  if (!updateQueueRepo) {
    const db = getDatabase();
    updateQueueRepo = new UpdateQueueRepository(db);
  }
  return updateQueueRepo;
}

export async function processAssessment(assessmentId: string): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    processedCount: 0,
    suggestionsCreated: 0,
    errors: []
  };

  try {
    const repo = getAssessmentsRepository();
    const assessment = repo.findById(assessmentId);

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    if (assessment.status !== 'SUBMITTED') {
      throw new Error('Assessment must be submitted before processing');
    }

    const template = await getTemplateWithQuestions(assessment.templateId);
    if (!template || !template.questions) {
      throw new Error('Template or questions not found');
    }

    repo.updateAIProcessingStatus(assessmentId, 'PENDING');

    for (const question of template.questions) {
      const answer = assessment.responseData[question.id];
      
      if (answer === undefined || answer === null || answer === '') {
        continue;
      }

      try {
        if (question.mappingConfig) {
          const suggestions = await processMappingRule(
            question.mappingConfig,
            answer,
            assessment.studentId,
            assessmentId,
            question
          );

          result.processedCount++;
          result.suggestionsCreated += suggestions.length;
        }
      } catch (error) {
        const errorMsg = `Error processing question ${question.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    const finalStatus = result.errors.length === 0 ? 'COMPLETED' : 'FAILED';
    repo.updateAIProcessingStatus(
      assessmentId,
      finalStatus,
      result.errors.length > 0 ? result.errors : undefined
    );

    return result;
  } catch (error) {
    const errorMsg = `Assessment processing failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);

    const repo = getAssessmentsRepository();
    repo.updateAIProcessingStatus(assessmentId, 'FAILED', [errorMsg]);

    return result;
  }
}

export async function processMappingRule(
  config: MappingConfig,
  answer: any,
  studentId: string,
  assessmentId: string,
  question: SelfAssessmentQuestion
): Promise<ProfileUpdateQueue[]> {
  switch (config.strategy) {
    case 'DIRECT':
      return processDirect(config, answer, studentId, assessmentId, question);
    
    case 'AI_STANDARDIZE':
    case 'AI_PARSE':
      return await processAIStandardize(config, answer, studentId, assessmentId, question);
    
    case 'SCALE_CONVERT':
      return processScaleConvert(config, answer, studentId, assessmentId, question);
    
    case 'ARRAY_MERGE':
      return processArrayMerge(config, answer, studentId, assessmentId, question);
    
    case 'MULTIPLE_FIELDS':
      return await processMultipleFields(config, answer, studentId, assessmentId, question);
    
    default:
      return [];
  }
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

async function processAIStandardize(
  config: MappingConfig,
  answer: any,
  studentId: string,
  assessmentId: string,
  question: SelfAssessmentQuestion
): Promise<ProfileUpdateQueue[]> {
  if (!config.targetTable || !config.targetField) {
    return [];
  }

  try {
    const aiProvider = AIProviderService.getInstance();
    const standardizedValue = await aiStandardize(answer, config);

    const queueRepo = getUpdateQueueRepository();
    const update: Omit<ProfileUpdateQueue, 'created_at'> = {
      id: randomUUID(),
      studentId,
      assessmentId,
      updateType: 'SELF_ASSESSMENT',
      targetTable: config.targetTable,
      targetField: config.targetField,
      proposedValue: typeof standardizedValue === 'string' ? standardizedValue : JSON.stringify(standardizedValue),
      reasoning: `Öğrenci anketi (AI standartlaştırma): ${question.questionText}`,
      confidence: 0.85,
      dataSource: question.id,
      status: question.requiresApproval ? 'PENDING' : 'AUTO_APPLIED'
    };

    return [queueRepo.create(update)];
  } catch (error) {
    console.error('AI standardization failed:', error);
    
    const fallbackValue = Array.isArray(answer) ? answer : [answer];
    const queueRepo = getUpdateQueueRepository();
    const update: Omit<ProfileUpdateQueue, 'created_at'> = {
      id: randomUUID(),
      studentId,
      assessmentId,
      updateType: 'SELF_ASSESSMENT',
      targetTable: config.targetTable,
      targetField: config.targetField,
      proposedValue: JSON.stringify(fallbackValue),
      reasoning: `Öğrenci anketi (AI hatası - ham veri): ${question.questionText}`,
      confidence: 0.5,
      dataSource: question.id,
      status: 'PENDING'
    };

    return [queueRepo.create(update)];
  }
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

async function processMultipleFields(
  config: MappingConfig,
  answer: any,
  studentId: string,
  assessmentId: string,
  question: SelfAssessmentQuestion
): Promise<ProfileUpdateQueue[]> {
  if (!config.mappings || config.mappings.length === 0) {
    return [];
  }

  const suggestions: ProfileUpdateQueue[] = [];
  const queueRepo = getUpdateQueueRepository();

  for (const mapping of config.mappings) {
    const targetField = mapping.field;
    let value: any = answer;
    let confidence = 1.0;

    if (mapping.parseWithAI) {
      try {
        const aiProvider = AIProviderService.getInstance();
        const extractedValue = await extractFieldWithAI(
          answer,
          targetField,
          question.questionText
        );
        value = extractedValue;
        confidence = 0.85;
      } catch (error) {
        console.error(`AI extraction failed for field ${targetField}:`, error);
        value = answer;
        confidence = 0.5;
      }
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
      confidence,
      dataSource: question.id,
      status: question.requiresApproval ? 'PENDING' : 'AUTO_APPLIED'
    };

    suggestions.push(queueRepo.create(update));
  }

  return suggestions;
}

export async function aiStandardize(
  input: any,
  config: MappingConfig
): Promise<any> {
  const aiProvider = AIProviderService.getInstance();

  const inputText = Array.isArray(input) 
    ? input.join(', ') 
    : String(input);

  const prompt = config.aiPrompt || buildStandardizationPrompt(inputText, config);

  const response = await aiProvider.chat({
    messages: [
      {
        role: 'system',
        content: 'Sen bir veri standartlaştırma asistanısın. Kullanıcının verdiği metni, belirtilen standart değerlere dönüştür. Sadece JSON formatında cevap ver.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    format: 'json'
  });

  try {
    const parsed = JSON.parse(response);
    return parsed.standardized || parsed.result || parsed;
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    throw new Error('AI response format invalid');
  }
}

function buildStandardizationPrompt(input: string, config: MappingConfig): string {
  let prompt = `Kullanıcı girişi: "${input}"\n\n`;

  if (config.standardValues && config.standardValues.length > 0) {
    prompt += `Standart değerler:\n${JSON.stringify(config.standardValues, null, 2)}\n\n`;
    prompt += `Bu girişi standart değerlere eşleştir. Eşleşen değerleri bir dizi olarak döndür.\n`;
    prompt += `Yanıt formatı: {"standardized": ["değer1", "değer2"]}\n`;
  } else {
    prompt += `Bu girişi temizle ve standartlaştır.\n`;
    prompt += `Yanıt formatı: {"standardized": "temiz değer"}\n`;
  }

  if (!config.allowCustom) {
    prompt += `ÖNEMLİ: Sadece standart değerler listesindeki değerleri kullan.\n`;
  }

  return prompt;
}

async function extractFieldWithAI(
  text: string,
  fieldName: string,
  questionText: string
): Promise<any> {
  const aiProvider = AIProviderService.getInstance();

  const prompt = `Soru: "${questionText}"
Cevap: "${text}"

Bu cevaptan "${fieldName}" bilgisini çıkar.

Yanıt formatı: {"value": "çıkarılan değer"}`;

  const response = await aiProvider.chat({
    messages: [
      {
        role: 'system',
        content: 'Sen bir metin analiz asistanısın. Verilen metinden belirtilen bilgiyi çıkar. Sadece JSON formatında cevap ver.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    format: 'json'
  });

  try {
    const parsed = JSON.parse(response);
    return parsed.value || parsed.result || text;
  } catch (error) {
    console.error('Failed to parse AI extraction response:', response);
    return text;
  }
}

export async function convertScale(
  value: number,
  sourceScale: { min: number; max: number },
  targetScale: { min: number; max: number }
): Promise<number> {
  const sourceRange = sourceScale.max - sourceScale.min;
  const targetRange = targetScale.max - targetScale.min;
  const normalized = (value - sourceScale.min) / sourceRange;
  const converted = targetScale.min + (normalized * targetRange);
  return Math.round(converted * 10) / 10;
}

export async function mergeArrays(
  existing: string[],
  newValues: string[],
  strategy: 'APPEND' | 'REPLACE' | 'UNIQUE_APPEND' = 'UNIQUE_APPEND'
): Promise<string[]> {
  switch (strategy) {
    case 'REPLACE':
      return newValues;
    
    case 'APPEND':
      return [...existing, ...newValues];
    
    case 'UNIQUE_APPEND':
      const combined = [...existing, ...newValues];
      return Array.from(new Set(combined));
    
    default:
      return newValues;
  }
}
