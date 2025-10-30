import type Database from 'better-sqlite3';
import type { ProfileMappingRule, TransformationType } from '../../../../shared/types/self-assessment.types';

export class MappingRulesRepository {
  constructor(private db: Database.Database) {}

  create(rule: Omit<ProfileMappingRule, 'created_at'>): ProfileMappingRule {
    const stmt = this.db.prepare(`
      INSERT INTO profile_mapping_rules (
        id, questionId, targetTable, targetField, transformationType,
        transformationConfig, validationRules, priority, conflictResolution, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      rule.id,
      rule.questionId,
      rule.targetTable,
      rule.targetField,
      rule.transformationType,
      rule.transformationConfig ? JSON.stringify(rule.transformationConfig) : null,
      rule.validationRules ? JSON.stringify(rule.validationRules) : null,
      rule.priority,
      rule.conflictResolution,
      rule.isActive ? 1 : 0
    );

    return this.findById(rule.id)!;
  }

  findById(id: string): ProfileMappingRule | null {
    const stmt = this.db.prepare(`
      SELECT * FROM profile_mapping_rules WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRowToRule(row);
  }

  findByQuestionId(questionId: string): ProfileMappingRule[] {
    const stmt = this.db.prepare(`
      SELECT * FROM profile_mapping_rules
      WHERE questionId = ? AND isActive = 1
      ORDER BY priority ASC
    `);

    const rows = stmt.all(questionId) as any[];
    return rows.map(row => this.mapRowToRule(row));
  }

  findByQuestionIds(questionIds: string[]): ProfileMappingRule[] {
    if (questionIds.length === 0) return [];

    const placeholders = questionIds.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      SELECT * FROM profile_mapping_rules
      WHERE questionId IN (${placeholders}) AND isActive = 1
      ORDER BY priority ASC
    `);

    const rows = stmt.all(...questionIds) as any[];
    return rows.map(row => this.mapRowToRule(row));
  }

  findAll(params?: { isActive?: boolean }): ProfileMappingRule[] {
    let query = 'SELECT * FROM profile_mapping_rules WHERE 1=1';
    const queryParams: any[] = [];

    if (params?.isActive !== undefined) {
      query += ' AND isActive = ?';
      queryParams.push(params.isActive ? 1 : 0);
    }

    query += ' ORDER BY priority ASC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...queryParams) as any[];

    return rows.map(row => this.mapRowToRule(row));
  }

  update(id: string, data: Partial<ProfileMappingRule>): ProfileMappingRule {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.targetTable !== undefined) {
      updates.push('targetTable = ?');
      params.push(data.targetTable);
    }
    if (data.targetField !== undefined) {
      updates.push('targetField = ?');
      params.push(data.targetField);
    }
    if (data.transformationType !== undefined) {
      updates.push('transformationType = ?');
      params.push(data.transformationType);
    }
    if (data.transformationConfig !== undefined) {
      updates.push('transformationConfig = ?');
      params.push(JSON.stringify(data.transformationConfig));
    }
    if (data.validationRules !== undefined) {
      updates.push('validationRules = ?');
      params.push(JSON.stringify(data.validationRules));
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      params.push(data.priority);
    }
    if (data.conflictResolution !== undefined) {
      updates.push('conflictResolution = ?');
      params.push(data.conflictResolution);
    }
    if (data.isActive !== undefined) {
      updates.push('isActive = ?');
      params.push(data.isActive ? 1 : 0);
    }

    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE profile_mapping_rules
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return this.findById(id)!;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM profile_mapping_rules WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToRule(row: any): ProfileMappingRule {
    return {
      id: row.id,
      questionId: row.questionId,
      targetTable: row.targetTable,
      targetField: row.targetField,
      transformationType: row.transformationType as TransformationType,
      transformationConfig: row.transformationConfig ? JSON.parse(row.transformationConfig) : undefined,
      validationRules: row.validationRules ? JSON.parse(row.validationRules) : undefined,
      priority: row.priority,
      conflictResolution: row.conflictResolution,
      isActive: Boolean(row.isActive),
      created_at: row.created_at
    };
  }
}
