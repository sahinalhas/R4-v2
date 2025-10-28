import getDatabase from '../../../lib/database.js';
import type { MultipleIntelligence } from '../types/index.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getMultipleIntelligenceByStudent: db.prepare('SELECT * FROM multiple_intelligence WHERE studentId = ? ORDER BY assessmentDate DESC'),
    insertMultipleIntelligence: db.prepare(`
      INSERT INTO multiple_intelligence (id, studentId, assessmentDate, linguisticVerbal, logicalMathematical, 
                                        visualSpatial, bodilyKinesthetic, musicalRhythmic, interpersonal, 
                                        intrapersonal, naturalistic, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getMultipleIntelligenceByStudent(studentId: string): MultipleIntelligence[] {
  try {
    ensureInitialized();
    return statements.getMultipleIntelligenceByStudent.all(studentId) as MultipleIntelligence[];
  } catch (error) {
    console.error('Database error in getMultipleIntelligenceByStudent:', error);
    throw error;
  }
}

export function insertMultipleIntelligence(record: MultipleIntelligence): void {
  try {
    ensureInitialized();
    statements.insertMultipleIntelligence.run(
      record.id,
      record.studentId,
      record.assessmentDate,
      record.linguisticVerbal,
      record.logicalMathematical,
      record.visualSpatial,
      record.bodilyKinesthetic,
      record.musicalRhythmic,
      record.interpersonal,
      record.intrapersonal,
      record.naturalistic,
      record.notes
    );
  } catch (error) {
    console.error('Error inserting multiple intelligence:', error);
    throw error;
  }
}
