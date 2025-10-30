import getDatabase from '../../../lib/database.js';
import { SelfAssessmentTemplatesRepository } from '../repository/index.js';
import { academicProfileTemplate, academicProfileQuestions } from './academic-profile-template.seed.js';
import { careerInterestsTemplate, careerInterestsQuestions } from './career-interests-template.seed.js';

export function seedSelfAssessmentTemplates(): void {
  console.log('🌱 Seeding self-assessment templates...');

  const db = getDatabase();
  const templatesRepo = new SelfAssessmentTemplatesRepository(db);

  try {
    const existingAcademic = templatesRepo.findById(academicProfileTemplate.id);
    if (!existingAcademic) {
      templatesRepo.create(academicProfileTemplate);
      console.log(`✅ Created template: ${academicProfileTemplate.title}`);

      for (const question of academicProfileQuestions) {
        const stmt = db.prepare(`
          INSERT INTO self_assessment_questions (
            id, templateId, questionText, questionType, options, orderIndex,
            required, helpText, targetProfileField, mappingStrategy, mappingConfig, requiresApproval
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          question.id,
          question.templateId,
          question.questionText,
          question.questionType,
          question.options ? JSON.stringify(question.options) : null,
          question.orderIndex,
          question.required ? 1 : 0,
          question.helpText || null,
          question.targetProfileField || null,
          question.mappingStrategy,
          question.mappingConfig ? JSON.stringify(question.mappingConfig) : null,
          question.requiresApproval ? 1 : 0
        );
      }
      console.log(`✅ Created ${academicProfileQuestions.length} questions for academic profile`);
    } else {
      console.log(`⏭️  Template already exists: ${academicProfileTemplate.title}`);
    }

    const existingCareer = templatesRepo.findById(careerInterestsTemplate.id);
    if (!existingCareer) {
      templatesRepo.create(careerInterestsTemplate);
      console.log(`✅ Created template: ${careerInterestsTemplate.title}`);

      for (const question of careerInterestsQuestions) {
        const stmt = db.prepare(`
          INSERT INTO self_assessment_questions (
            id, templateId, questionText, questionType, options, orderIndex,
            required, helpText, targetProfileField, mappingStrategy, mappingConfig, requiresApproval
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          question.id,
          question.templateId,
          question.questionText,
          question.questionType,
          question.options ? JSON.stringify(question.options) : null,
          question.orderIndex,
          question.required ? 1 : 0,
          question.helpText || null,
          question.targetProfileField || null,
          question.mappingStrategy,
          question.mappingConfig ? JSON.stringify(question.mappingConfig) : null,
          question.requiresApproval ? 1 : 0
        );
      }
      console.log(`✅ Created ${careerInterestsQuestions.length} questions for career interests`);
    } else {
      console.log(`⏭️  Template already exists: ${careerInterestsTemplate.title}`);
    }

    console.log('🎉 Self-assessment templates seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding self-assessment templates:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedSelfAssessmentTemplates();
}
