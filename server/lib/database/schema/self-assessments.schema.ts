import type Database from 'better-sqlite3';

export function createSelfAssessmentsTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS self_assessment_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL CHECK (category IN ('ACADEMIC', 'SOCIAL_EMOTIONAL', 'CAREER', 'HEALTH', 'FAMILY', 'TALENTS')),
      targetGrades TEXT,
      isActive INTEGER DEFAULT 1,
      requiresParentConsent INTEGER DEFAULT 0,
      estimatedDuration INTEGER,
      orderIndex INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS self_assessment_questions (
      id TEXT PRIMARY KEY,
      templateId TEXT NOT NULL,
      questionText TEXT NOT NULL,
      questionType TEXT NOT NULL CHECK (questionType IN ('MULTIPLE_CHOICE', 'MULTI_SELECT', 'TEXT', 'SCALE', 'YES_NO', 'DROPDOWN')),
      options TEXT,
      orderIndex INTEGER NOT NULL,
      required INTEGER DEFAULT 0,
      helpText TEXT,
      targetProfileField TEXT,
      mappingStrategy TEXT NOT NULL CHECK (mappingStrategy IN ('DIRECT', 'AI_PARSE', 'AI_STANDARDIZE', 'MULTIPLE_FIELDS', 'CALCULATED', 'SCALE_CONVERT', 'ARRAY_MERGE')),
      mappingConfig TEXT,
      requiresApproval INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (templateId) REFERENCES self_assessment_templates (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS student_self_assessments (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      templateId TEXT NOT NULL,
      status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'PROCESSING', 'APPROVED', 'REJECTED')),
      completionPercentage INTEGER DEFAULT 0,
      responseData TEXT NOT NULL,
      submittedAt TEXT,
      parentConsentGiven INTEGER DEFAULT 0,
      parentConsentDate TEXT,
      parentConsentIp TEXT,
      parentConsentToken TEXT,
      parentConsentTokenExpiry INTEGER,
      parentName TEXT,
      reviewedBy TEXT,
      reviewedAt TEXT,
      reviewNotes TEXT,
      aiProcessingStatus TEXT DEFAULT 'PENDING' CHECK (aiProcessingStatus IN ('PENDING', 'COMPLETED', 'FAILED')),
      aiProcessingErrors TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (templateId) REFERENCES self_assessment_templates (id) ON DELETE CASCADE,
      FOREIGN KEY (reviewedBy) REFERENCES users (id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_mapping_rules (
      id TEXT PRIMARY KEY,
      questionId TEXT NOT NULL,
      targetTable TEXT NOT NULL,
      targetField TEXT NOT NULL,
      transformationType TEXT NOT NULL CHECK (transformationType IN ('DIRECT', 'AI_STANDARDIZE', 'SCALE_CONVERT', 'ARRAY_MERGE', 'CUSTOM')),
      transformationConfig TEXT,
      validationRules TEXT,
      priority INTEGER DEFAULT 1,
      conflictResolution TEXT DEFAULT 'NEWER_WINS' CHECK (conflictResolution IN ('NEWER_WINS', 'MERGE', 'MANUAL_REVIEW')),
      isActive INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (questionId) REFERENCES self_assessment_questions (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_update_queue (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentId TEXT,
      updateType TEXT NOT NULL CHECK (updateType IN ('SELF_ASSESSMENT', 'AI_SUGGESTION', 'MANUAL')),
      targetTable TEXT NOT NULL,
      targetField TEXT NOT NULL,
      currentValue TEXT,
      proposedValue TEXT NOT NULL,
      reasoning TEXT,
      confidence REAL,
      dataSource TEXT,
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPLIED')),
      reviewedBy TEXT,
      reviewedAt TEXT,
      reviewNotes TEXT,
      autoApplyAfter TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (assessmentId) REFERENCES student_self_assessments (id) ON DELETE CASCADE,
      FOREIGN KEY (reviewedBy) REFERENCES users (id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS self_assessment_audit_log (
      id TEXT PRIMARY KEY,
      assessmentId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PROFILE_UPDATED', 'PARENT_CONSENT')),
      performedBy TEXT,
      performedByRole TEXT CHECK (performedByRole IN ('STUDENT', 'PARENT', 'COUNSELOR', 'SYSTEM')),
      changeData TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessmentId) REFERENCES student_self_assessments (id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_self_assessment_questions_template 
    ON self_assessment_questions(templateId);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_student_self_assessments_student 
    ON student_self_assessments(studentId);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_student_self_assessments_template 
    ON student_self_assessments(templateId);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_student_self_assessments_status 
    ON student_self_assessments(status);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_profile_update_queue_student 
    ON profile_update_queue(studentId);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_profile_update_queue_status 
    ON profile_update_queue(status);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_self_assessment_audit_log_student 
    ON self_assessment_audit_log(studentId);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_self_assessment_audit_log_assessment 
    ON self_assessment_audit_log(assessmentId);
  `);
}

export function addSelfAssessmentFieldsToStudents(db: Database.Database): void {
  const existingColumns = db.prepare(`PRAGMA table_info(students)`).all() as any[];
  const columnNames = existingColumns.map((col: any) => col.name);

  if (!columnNames.includes('lastSelfAssessmentDate')) {
    db.exec(`ALTER TABLE students ADD COLUMN lastSelfAssessmentDate TEXT;`);
  }

  if (!columnNames.includes('selfAssessmentCompletionRate')) {
    db.exec(`ALTER TABLE students ADD COLUMN selfAssessmentCompletionRate INTEGER DEFAULT 0;`);
  }

  if (!columnNames.includes('profileDataSource')) {
    db.exec(`ALTER TABLE students ADD COLUMN profileDataSource TEXT DEFAULT 'MANUAL';`);
  }
}
