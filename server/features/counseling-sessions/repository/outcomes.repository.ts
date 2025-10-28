import getDatabase from '../../../lib/database.js';
import type { CounselingOutcome } from '../types/index.js';
import type { Statement } from 'better-sqlite3';

let statements: Record<string, Statement> | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllOutcomes: db.prepare(`
      SELECT * FROM counseling_outcomes 
      ORDER BY created_at DESC
    `),
    getOutcomeById: db.prepare('SELECT * FROM counseling_outcomes WHERE id = ?'),
    getOutcomeBySessionId: db.prepare('SELECT * FROM counseling_outcomes WHERE sessionId = ?'),
    getOutcomesRequiringFollowUp: db.prepare(`
      SELECT * FROM counseling_outcomes 
      WHERE followUpRequired = 1 
      AND (followUpDate IS NULL OR followUpDate <= ?)
      ORDER BY followUpDate ASC
    `),
    getOutcomesByRating: db.prepare(`
      SELECT * FROM counseling_outcomes 
      WHERE effectivenessRating = ?
      ORDER BY created_at DESC
    `),
    insertOutcome: db.prepare(`
      INSERT INTO counseling_outcomes (
        id, sessionId, effectivenessRating, progressNotes, 
        goalsAchieved, nextSteps, recommendations, 
        followUpRequired, followUpDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateOutcome: db.prepare(`
      UPDATE counseling_outcomes 
      SET effectivenessRating = ?, progressNotes = ?, goalsAchieved = ?,
          nextSteps = ?, recommendations = ?, followUpRequired = ?, 
          followUpDate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    deleteOutcome: db.prepare('DELETE FROM counseling_outcomes WHERE id = ?')
  };
  
  isInitialized = true;
}

export function getAllOutcomes(): CounselingOutcome[] {
  ensureInitialized();
  return statements!.getAllOutcomes.all() as CounselingOutcome[];
}

export function getOutcomeById(id: string): CounselingOutcome | null {
  ensureInitialized();
  return statements!.getOutcomeById.get(id) as CounselingOutcome | null;
}

export function getOutcomeBySessionId(sessionId: string): CounselingOutcome | null {
  ensureInitialized();
  return statements!.getOutcomeBySessionId.get(sessionId) as CounselingOutcome | null;
}

export function getOutcomesRequiringFollowUp(currentDate: string): CounselingOutcome[] {
  ensureInitialized();
  return statements!.getOutcomesRequiringFollowUp.all(currentDate) as CounselingOutcome[];
}

export function getOutcomesByRating(rating: number): CounselingOutcome[] {
  ensureInitialized();
  return statements!.getOutcomesByRating.all(rating) as CounselingOutcome[];
}

export function insertOutcome(outcome: CounselingOutcome): void {
  ensureInitialized();
  statements!.insertOutcome.run(
    outcome.id,
    outcome.sessionId,
    outcome.effectivenessRating || null,
    outcome.progressNotes || null,
    outcome.goalsAchieved || null,
    outcome.nextSteps || null,
    outcome.recommendations || null,
    outcome.followUpRequired ? 1 : 0,
    outcome.followUpDate || null
  );
}

export function updateOutcome(id: string, outcome: Partial<CounselingOutcome>): { changes: number } {
  ensureInitialized();
  const result = statements!.updateOutcome.run(
    outcome.effectivenessRating || null,
    outcome.progressNotes || null,
    outcome.goalsAchieved || null,
    outcome.nextSteps || null,
    outcome.recommendations || null,
    outcome.followUpRequired ? 1 : 0,
    outcome.followUpDate || null,
    id
  );
  return { changes: result.changes };
}

export function deleteOutcome(id: string): { changes: number } {
  ensureInitialized();
  const result = statements!.deleteOutcome.run(id);
  return { changes: result.changes };
}
