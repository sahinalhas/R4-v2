/**
 * Database schema for standardized student profile data
 * Designed for AI analysis with structured, measurable fields
 */

export const createAcademicProfileTable = `
CREATE TABLE IF NOT EXISTS academic_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  strongSubjects TEXT, -- JSON array of subject codes
  weakSubjects TEXT, -- JSON array of subject codes
  strongSkills TEXT, -- JSON array of skill codes
  weakSkills TEXT, -- JSON array of skill codes
  primaryLearningStyle TEXT,
  secondaryLearningStyle TEXT,
  overallMotivation INTEGER,
  studyHoursPerWeek REAL,
  homeworkCompletionRate INTEGER,
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createSocialEmotionalProfileTable = `
CREATE TABLE IF NOT EXISTS social_emotional_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  strongSocialSkills TEXT, -- JSON array
  developingSocialSkills TEXT, -- JSON array
  empathyLevel INTEGER,
  selfAwarenessLevel INTEGER,
  emotionRegulationLevel INTEGER,
  conflictResolutionLevel INTEGER,
  leadershipLevel INTEGER,
  teamworkLevel INTEGER,
  communicationLevel INTEGER,
  friendCircleSize TEXT CHECK (friendCircleSize IN ('YOK', 'AZ', 'ORTA', 'GENİŞ')),
  friendCircleQuality TEXT CHECK (friendCircleQuality IN ('ZAYIF', 'ORTA', 'İYİ', 'ÇOK_İYİ')),
  socialRole TEXT CHECK (socialRole IN ('LİDER', 'AKTİF_ÜYE', 'TAKİPÇİ', 'GÖZLEMCİ', 'İZOLE')),
  bullyingStatus TEXT CHECK (bullyingStatus IN ('YOK', 'MAĞDUR', 'FAİL', 'HER_İKİSİ', 'GÖZLEMCİ')),
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createTalentsInterestsProfileTable = `
CREATE TABLE IF NOT EXISTS talents_interests_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  creativeTalents TEXT, -- JSON array
  physicalTalents TEXT, -- JSON array
  primaryInterests TEXT, -- JSON array
  exploratoryInterests TEXT, -- JSON array
  talentProficiency TEXT, -- JSON object {talent: score}
  weeklyEngagementHours REAL,
  clubMemberships TEXT, -- JSON array
  competitionsParticipated TEXT, -- JSON array
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createStandardizedHealthProfileTable = `
CREATE TABLE IF NOT EXISTS standardized_health_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL UNIQUE,
  bloodType TEXT,
  chronicDiseases TEXT, -- JSON array of disease codes
  allergies TEXT, -- JSON array of allergy codes
  currentMedications TEXT, -- JSON array of medication codes
  medicalHistory TEXT,
  specialNeeds TEXT,
  physicalLimitations TEXT,
  emergencyContact1Name TEXT,
  emergencyContact1Phone TEXT,
  emergencyContact1Relation TEXT,
  emergencyContact2Name TEXT,
  emergencyContact2Phone TEXT,
  emergencyContact2Relation TEXT,
  physicianName TEXT,
  physicianPhone TEXT,
  lastHealthCheckup TEXT,
  additionalNotes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createStandardizedInterventionTable = `
CREATE TABLE IF NOT EXISTS standardized_interventions (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  interventionType TEXT NOT NULL,
  interventionCategory TEXT NOT NULL CHECK (interventionCategory IN ('akademik', 'davranışsal', 'sosyal', 'aile', 'psikolojik', 'kariyer')),
  targetIssues TEXT, -- JSON array
  targetSkills TEXT, -- JSON array
  startDate TEXT NOT NULL,
  endDate TEXT,
  sessionFrequency TEXT CHECK (sessionFrequency IN ('GÜNLÜK', 'HAFTALIK', 'İKİ_HAFTADA', 'AYLIK')),
  totalSessions INTEGER,
  completedSessions INTEGER DEFAULT 0,
  initialAssessment INTEGER,
  currentAssessment INTEGER,
  effectiveness TEXT CHECK (effectiveness IN ('ÇOK_ETKİLİ', 'ETKİLİ', 'KISMEN_ETKİLİ', 'ETKİSİZ', 'DEĞERLENDİRİLMEDİ')),
  status TEXT NOT NULL CHECK (status IN ('PLANLANDI', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'İPTAL', 'BEKLEMEDE')),
  assignedCounselor TEXT,
  otherStaff TEXT, -- JSON array
  description TEXT,
  progressNotes TEXT,
  outcomeNotes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createStandardizedBehaviorIncidentTable = `
CREATE TABLE IF NOT EXISTS standardized_behavior_incidents (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  incidentDate TEXT NOT NULL,
  incidentTime TEXT,
  location TEXT NOT NULL,
  behaviorCategory TEXT NOT NULL,
  behaviorType TEXT NOT NULL CHECK (behaviorType IN ('OLUMLU', 'KÜÇÜK_İHLAL', 'ORTA_DÜZEY', 'CİDDİ', 'ÇOK_CİDDİ')),
  antecedent TEXT,
  description TEXT NOT NULL,
  consequence TEXT,
  interventionsUsed TEXT, -- JSON array
  interventionEffectiveness TEXT CHECK (interventionEffectiveness IN ('ÇOK_ETKİLİ', 'ETKİLİ', 'KISMEN_ETKİLİ', 'ETKİSİZ')),
  parentNotified INTEGER DEFAULT 0,
  adminNotified INTEGER DEFAULT 0,
  followUpNeeded INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('AÇIK', 'DEVAM_EDIYOR', 'ÇÖZÜLDÜ', 'İZLENIYOR')),
  reportedBy TEXT NOT NULL,
  witnessedBy TEXT, -- JSON array
  additionalNotes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createMotivationProfileTable = `
CREATE TABLE IF NOT EXISTS motivation_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  primaryMotivationSources TEXT, -- JSON array
  academicMotivation INTEGER,
  socialMotivation INTEGER,
  achievementMotivation INTEGER,
  intrinsicMotivation INTEGER,
  extrinsicMotivation INTEGER,
  hasShortTermGoals INTEGER DEFAULT 0,
  hasLongTermGoals INTEGER DEFAULT 0,
  goalClarityLevel INTEGER,
  goalCommitmentLevel INTEGER,
  careerAspirations TEXT, -- JSON array
  universityPreferences TEXT, -- JSON array
  academicGoals TEXT, -- JSON array (added in migration 024)
  persistenceLevel INTEGER, -- 1-10 scale (added in migration 024)
  futureOrientationLevel INTEGER, -- 1-10 scale (added in migration 024)
  shortTermGoals TEXT, -- Text field (added in migration 024)
  longTermGoals TEXT, -- Text field (added in migration 024)
  obstacles TEXT, -- Text field (added in migration 024)
  supportNeeds TEXT, -- Text field (added in migration 024)
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createRiskProtectiveProfileTable = `
CREATE TABLE IF NOT EXISTS risk_protective_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  academicRiskLevel TEXT CHECK (academicRiskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  behavioralRiskLevel TEXT CHECK (behavioralRiskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  socialEmotionalRiskLevel TEXT CHECK (socialEmotionalRiskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  attendanceRiskLevel TEXT CHECK (attendanceRiskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  dropoutRisk TEXT CHECK (dropoutRisk IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  activeProtectiveFactors TEXT, -- JSON array
  academicRiskFactors TEXT,
  behavioralRiskFactors TEXT,
  socialRiskFactors TEXT,
  familyRiskFactors TEXT,
  overallRiskScore INTEGER,
  recommendedInterventions TEXT, -- JSON array
  assignedCounselor TEXT,
  parentNotified INTEGER DEFAULT 0,
  nextAssessmentDate TEXT,
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createAggregateScoresTable = `
CREATE TABLE IF NOT EXISTS student_aggregate_scores (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL UNIQUE,
  lastUpdated TEXT NOT NULL,
  academicPerformance INTEGER,
  socialCompetence INTEGER,
  emotionalWellbeing INTEGER,
  behavioralHealth INTEGER,
  motivationLevel INTEGER,
  overallRisk INTEGER,
  protectiveFactorsScore INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createAIInsightsTable = `
CREATE TABLE IF NOT EXISTS student_ai_insights (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  generatedAt TEXT NOT NULL,
  strengthsSummary TEXT, -- JSON array
  concernsSummary TEXT, -- JSON array
  recommendedActions TEXT, -- JSON array
  predictedOutcomes TEXT, -- JSON array
  confidenceScore REAL,
  modelVersion TEXT,
  dataSourcesUsed TEXT, -- JSON array
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createIndexes = `
CREATE INDEX IF NOT EXISTS idx_academic_profiles_student ON academic_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_social_emotional_profiles_student ON social_emotional_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_talents_interests_profiles_student ON talents_interests_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_standardized_interventions_student ON standardized_interventions(studentId);
CREATE INDEX IF NOT EXISTS idx_standardized_interventions_status ON standardized_interventions(status);
CREATE INDEX IF NOT EXISTS idx_standardized_behavior_incidents_student ON standardized_behavior_incidents(studentId);
CREATE INDEX IF NOT EXISTS idx_standardized_behavior_incidents_date ON standardized_behavior_incidents(incidentDate);
CREATE INDEX IF NOT EXISTS idx_motivation_profiles_student ON motivation_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_risk_protective_profiles_student ON risk_protective_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_ai_insights_student ON student_ai_insights(studentId);
`;

export const initStandardizedProfileTables = (db: any) => {
  db.exec(createAcademicProfileTable);
  db.exec(createSocialEmotionalProfileTable);
  db.exec(createTalentsInterestsProfileTable);
  db.exec(createStandardizedHealthProfileTable);
  db.exec(createStandardizedInterventionTable);
  db.exec(createStandardizedBehaviorIncidentTable);
  db.exec(createMotivationProfileTable);
  db.exec(createRiskProtectiveProfileTable);
  db.exec(createAggregateScoresTable);
  db.exec(createAIInsightsTable);
  db.exec(createIndexes);
};
