/**
 * Database Backup Service
 * Veritabanı Yedekleme Servisi
 */

import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import getDatabase from '../../../lib/database';

export interface BackupMetadata {
  id: string;
  filename: string;
  createdAt: string;
  createdBy: string;
  size: number;
  type: 'manual' | 'automatic';
  compressed: boolean;
  tables: string[];
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface BackupOptions {
  compress?: boolean;
  tables?: string[];
  includeSchema?: boolean;
  anonymize?: boolean;
}

export class BackupService {
  private backupDir = path.join(process.cwd(), 'backups');
  private maxBackups = 30;
  
  constructor() {
    this.ensureBackupDirectory();
  }
  
  private async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create backup directory:', error);
    }
  }
  
  async createBackup(
    createdBy: string,
    type: 'manual' | 'automatic' = 'manual',
    options: BackupOptions = {}
  ): Promise<BackupMetadata> {
    const {
      compress = true,
      tables = [],
      includeSchema = true,
      anonymize = false
    } = options;
    
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${backupId}_${timestamp}.sql${compress ? '.gz' : ''}`;
    const filepath = path.join(this.backupDir, filename);
    
    const metadata: BackupMetadata = {
      id: backupId,
      filename,
      createdAt: new Date().toISOString(),
      createdBy,
      size: 0,
      type,
      compressed: compress,
      tables: tables.length > 0 ? tables : await this.getAllTables(),
      status: 'pending',
    };
    
    try {
      await this.saveBackupMetadata(metadata);
      
      const sqlDump = await this.generateSQLDump(metadata.tables, includeSchema, anonymize);
      
      if (compress) {
        await this.compressAndSave(sqlDump, filepath);
      } else {
        await fs.writeFile(filepath, sqlDump, 'utf-8');
      }
      
      const stats = await fs.stat(filepath);
      metadata.size = stats.size;
      metadata.status = 'completed';
      
      await this.updateBackupMetadata(metadata);
      await this.cleanupOldBackups();
      
      return metadata;
    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : 'Unknown error';
      await this.updateBackupMetadata(metadata);
      throw error;
    }
  }
  
  async restoreBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId);
    
    if (!metadata) {
      throw new Error('Backup not found');
    }
    
    const filepath = path.join(this.backupDir, metadata.filename);
    
    let sqlContent: string;
    
    if (metadata.compressed) {
      sqlContent = await this.decompressFile(filepath);
    } else {
      sqlContent = await fs.readFile(filepath, 'utf-8');
    }
    
    await this.executeSQLDump(sqlContent);
  }
  
  async listBackups(): Promise<BackupMetadata[]> {
    const metadataFiles = await fs.readdir(this.backupDir);
    const metadataList: BackupMetadata[] = [];
    
    for (const file of metadataFiles) {
      if (file.endsWith('.meta.json')) {
        const content = await fs.readFile(path.join(this.backupDir, file), 'utf-8');
        metadataList.push(JSON.parse(content));
      }
    }
    
    return metadataList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async deleteBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId);
    
    if (!metadata) {
      throw new Error('Backup not found');
    }
    
    const filepath = path.join(this.backupDir, metadata.filename);
    const metaPath = path.join(this.backupDir, `${backupId}.meta.json`);
    
    await Promise.all([
      fs.unlink(filepath).catch(() => {}),
      fs.unlink(metaPath).catch(() => {})
    ]);
  }
  
  async scheduleAutomaticBackup(userId: string): Promise<void> {
    await this.createBackup(userId, 'automatic', { compress: true });
  }
  
  private async getAllTables(): Promise<string[]> {
    const db = getDatabase();
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all() as { name: string }[];
    
    return tables.map(t => t.name);
  }
  
  private async generateSQLDump(
    tables: string[], 
    includeSchema: boolean, 
    anonymize: boolean
  ): Promise<string> {
    const db = getDatabase();
    let dump = `-- Rehber360 Database Backup\n`;
    dump += `-- Created at: ${new Date().toISOString()}\n`;
    dump += `-- Tables: ${tables.join(', ')}\n\n`;
    
    for (const table of tables) {
      if (includeSchema) {
        const schema = db.prepare(`
          SELECT sql FROM sqlite_master WHERE type='table' AND name=?
        `).get(table) as { sql: string } | undefined;
        
        if (schema) {
          dump += `${schema.sql};\n\n`;
        }
      }
      
      const rows = db.prepare(`SELECT * FROM ${table}`).all();
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        
        for (const row of rows) {
          const values = columns.map(col => {
            let value = (row as any)[col];
            
            if (anonymize && this.isSensitiveField(col)) {
              value = this.anonymizeValue(col, value);
            }
            
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            return value;
          });
          
          dump += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        dump += '\n';
      }
    }
    
    return dump;
  }
  
  private async executeSQLDump(sqlContent: string): Promise<void> {
    const db = getDatabase();
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    db.transaction(() => {
      for (const statement of statements) {
        db.prepare(statement).run();
      }
    })();
  }
  
  private async compressAndSave(content: string, filepath: string): Promise<void> {
    const tempFile = `${filepath}.temp`;
    await fs.writeFile(tempFile, content, 'utf-8');
    
    const gzip = createGzip();
    const source = createReadStream(tempFile);
    const destination = createWriteStream(filepath);
    
    await pipeline(source, gzip, destination);
    await fs.unlink(tempFile);
  }
  
  private async decompressFile(filepath: string): Promise<string> {
    const gunzip = createGunzip();
    const source = createReadStream(filepath);
    
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      source
        .pipe(gunzip)
        .on('data', chunk => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
        .on('error', reject);
    });
  }
  
  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metaPath = path.join(this.backupDir, `${metadata.id}.meta.json`);
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }
  
  private async updateBackupMetadata(metadata: BackupMetadata): Promise<void> {
    await this.saveBackupMetadata(metadata);
  }
  
  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const metaPath = path.join(this.backupDir, `${backupId}.meta.json`);
      const content = await fs.readFile(metaPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  
  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups();
    
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      
      for (const backup of toDelete) {
        await this.deleteBackup(backup.id);
      }
    }
  }
  
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'email', 'phone', 'tc_no', 'password', 'address',
      'parent_phone', 'emergency_contact'
    ];
    return sensitiveFields.some(f => fieldName.toLowerCase().includes(f));
  }
  
  private anonymizeValue(fieldName: string, value: any): string {
    if (value === null || value === undefined) return value;
    
    const str = String(value);
    
    if (fieldName.includes('email')) {
      return 'anonymized@example.com';
    }
    if (fieldName.includes('phone')) {
      return '05XXXXXXXXX';
    }
    if (fieldName.includes('tc_no')) {
      return 'XXXXXXXXXXXX';
    }
    if (fieldName.includes('address')) {
      return 'Gizli Adres';
    }
    
    return str.substring(0, 2) + 'X'.repeat(Math.max(0, str.length - 2));
  }
}

export const backupService = new BackupService();
