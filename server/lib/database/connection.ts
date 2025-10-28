import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    try {
      const dbPath = path.join(process.cwd(), 'database.db');
      db = new Database(dbPath);
      
      try {
        db.prepare('SELECT 1').get();
      } catch (connectionError) {
        console.error('Database connection test failed:', connectionError);
        db.close();
        db = null;
        throw new Error('Failed to establish database connection');
      }
      
      try {
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        db.pragma('encoding = "UTF-8"');
      } catch (pragmaError) {
        console.error('Failed to set database pragmas:', pragmaError);
        db.close();
        db = null;
        throw new Error('Failed to configure database settings');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          console.error('Error closing database after initialization failure:', closeError);
        }
        db = null;
      }
      throw error;
    }
  }
  return db;
}
