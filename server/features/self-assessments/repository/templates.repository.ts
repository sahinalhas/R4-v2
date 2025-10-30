import type Database from 'better-sqlite3';
import type { SelfAssessmentTemplate, TemplateWithQuestions } from '../../../../shared/types/self-assessment.types';

export class SelfAssessmentTemplatesRepository {
  constructor(private db: Database.Database) {}

  create(template: Omit<SelfAssessmentTemplate, 'created_at' | 'updated_at'>): SelfAssessmentTemplate {
    const stmt = this.db.prepare(`
      INSERT INTO self_assessment_templates (
        id, title, description, category, targetGrades, isActive,
        requiresParentConsent, estimatedDuration, orderIndex
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      template.id,
      template.title,
      template.description || null,
      template.category,
      template.targetGrades ? JSON.stringify(template.targetGrades) : null,
      template.isActive ? 1 : 0,
      template.requiresParentConsent ? 1 : 0,
      template.estimatedDuration || null,
      template.orderIndex || null
    );

    return this.findById(template.id)!;
  }

  findById(id: string): SelfAssessmentTemplate | null {
    const stmt = this.db.prepare(`
      SELECT * FROM self_assessment_templates WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRowToTemplate(row);
  }

  findAll(params?: { isActive?: boolean; category?: string }): SelfAssessmentTemplate[] {
    let query = 'SELECT * FROM self_assessment_templates WHERE 1=1';
    const queryParams: any[] = [];

    if (params?.isActive !== undefined) {
      query += ' AND isActive = ?';
      queryParams.push(params.isActive ? 1 : 0);
    }

    if (params?.category) {
      query += ' AND category = ?';
      queryParams.push(params.category);
    }

    query += ' ORDER BY orderIndex ASC, created_at DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...queryParams) as any[];

    return rows.map(row => this.mapRowToTemplate(row));
  }

  findByIdWithQuestions(id: string): TemplateWithQuestions | null {
    const template = this.findById(id);
    if (!template) return null;

    const questionsStmt = this.db.prepare(`
      SELECT * FROM self_assessment_questions
      WHERE templateId = ?
      ORDER BY orderIndex ASC
    `);

    const questionRows = questionsStmt.all(id) as any[];

    const questions = questionRows.map(row => ({
      id: row.id,
      templateId: row.templateId,
      questionText: row.questionText,
      questionType: row.questionType,
      options: row.options ? JSON.parse(row.options) : undefined,
      orderIndex: row.orderIndex,
      required: Boolean(row.required),
      helpText: row.helpText,
      targetProfileField: row.targetProfileField,
      mappingStrategy: row.mappingStrategy,
      mappingConfig: row.mappingConfig ? JSON.parse(row.mappingConfig) : undefined,
      requiresApproval: Boolean(row.requiresApproval),
      created_at: row.created_at
    }));

    return {
      ...template,
      questions
    };
  }

  update(id: string, data: Partial<SelfAssessmentTemplate>): SelfAssessmentTemplate {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }
    if (data.targetGrades !== undefined) {
      updates.push('targetGrades = ?');
      params.push(JSON.stringify(data.targetGrades));
    }
    if (data.isActive !== undefined) {
      updates.push('isActive = ?');
      params.push(data.isActive ? 1 : 0);
    }
    if (data.requiresParentConsent !== undefined) {
      updates.push('requiresParentConsent = ?');
      params.push(data.requiresParentConsent ? 1 : 0);
    }
    if (data.estimatedDuration !== undefined) {
      updates.push('estimatedDuration = ?');
      params.push(data.estimatedDuration);
    }
    if (data.orderIndex !== undefined) {
      updates.push('orderIndex = ?');
      params.push(data.orderIndex);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE self_assessment_templates
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return this.findById(id)!;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM self_assessment_templates WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToTemplate(row: any): SelfAssessmentTemplate {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      targetGrades: row.targetGrades ? JSON.parse(row.targetGrades) : undefined,
      isActive: Boolean(row.isActive),
      requiresParentConsent: Boolean(row.requiresParentConsent),
      estimatedDuration: row.estimatedDuration,
      orderIndex: row.orderIndex,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
