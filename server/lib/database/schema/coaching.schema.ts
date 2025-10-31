import type Database from 'better-sqlite3';
import { createMultipleIntelligenceTable } from './coaching/multiple-intelligence.schema';
import { createLearningStylesTable } from './coaching/learning-styles.schema';
import { createSmartGoalsTable } from './coaching/smart-goals.schema';
import { createCoachingRecommendationsTable } from './coaching/coaching-recommendations.schema';
import { createEvaluations360Table } from './coaching/evaluations-360.schema';
import { createAchievementsTable } from './coaching/achievements.schema';
import { createSelfAssessmentsTable } from './coaching/self-assessments.schema';

export function createCoachingTables(db: Database.Database): void {
  createMultipleIntelligenceTable(db);
  createLearningStylesTable(db);
  createSmartGoalsTable(db);
  createCoachingRecommendationsTable(db);
  createEvaluations360Table(db);
  createAchievementsTable(db);
  createSelfAssessmentsTable(db);
}
