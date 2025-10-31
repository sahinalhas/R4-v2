import type Database from 'better-sqlite3';

export function setupDatabaseTriggers(db: Database.Database): void {
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_students_timestamp 
    AFTER UPDATE ON students 
    BEGIN 
      UPDATE students SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_progress_timestamp 
    AFTER UPDATE ON progress 
    BEGIN 
      UPDATE progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_academic_goals_timestamp 
    AFTER UPDATE ON academic_goals 
    BEGIN 
      UPDATE academic_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
    AFTER UPDATE ON notes 
    BEGIN 
      UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_surveys_timestamp 
    AFTER UPDATE ON surveys 
    BEGIN 
      UPDATE surveys SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_meeting_notes_timestamp 
    AFTER UPDATE ON meeting_notes 
    BEGIN 
      UPDATE meeting_notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_app_settings_timestamp 
    AFTER UPDATE ON app_settings 
    BEGIN 
      UPDATE app_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_user_sessions_timestamp 
    AFTER UPDATE ON user_sessions 
    BEGIN 
      UPDATE user_sessions SET updated_at = CURRENT_TIMESTAMP WHERE userId = NEW.userId; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_smart_goals_timestamp 
    AFTER UPDATE ON smart_goals 
    BEGIN 
      UPDATE smart_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_coaching_recommendations_timestamp 
    AFTER UPDATE ON coaching_recommendations 
    BEGIN 
      UPDATE coaching_recommendations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_parent_meetings_timestamp 
    AFTER UPDATE ON parent_meetings 
    BEGIN 
      UPDATE parent_meetings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_home_visits_timestamp 
    AFTER UPDATE ON home_visits 
    BEGIN 
      UPDATE home_visits SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_family_participation_timestamp 
    AFTER UPDATE ON family_participation 
    BEGIN 
      UPDATE family_participation SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_special_education_timestamp 
    AFTER UPDATE ON special_education 
    BEGIN 
      UPDATE special_education SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_exam_results_timestamp 
    AFTER UPDATE ON exam_results 
    BEGIN 
      UPDATE exam_results SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_counseling_sessions_timestamp 
    AFTER UPDATE ON counseling_sessions 
    BEGIN 
      UPDATE counseling_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
    END;
  `);
}
