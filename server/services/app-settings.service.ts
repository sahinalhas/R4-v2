/**
 * App Settings Service
 * Uygulama ayarlarını yönetir
 */

import getDatabase from '../lib/database.js';

interface AppSettings {
  aiProvider?: {
    provider: 'openai' | 'ollama' | 'gemini';
    model: string;
    ollamaBaseUrl?: string;
  };
  [key: string]: any;
}

export class AppSettingsService {
  private static getDefaultSettings(): AppSettings {
    return {
      aiProvider: {
        provider: process.env.GEMINI_API_KEY ? 'gemini' : 'ollama',
        model: process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : 'llama3',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
      }
    };
  }

  static getSettings(): AppSettings {
    const db = getDatabase();
    
    try {
      const row = db.prepare('SELECT settings FROM app_settings WHERE id = 1').get() as { settings: string } | undefined;
      
      if (!row) {
        const defaults = this.getDefaultSettings();
        this.saveSettings(defaults);
        return defaults;
      }
      
      return JSON.parse(row.settings);
    } catch (error) {
      console.error('Failed to get app settings:', error);
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: AppSettings): void {
    const db = getDatabase();
    
    try {
      const settingsJson = JSON.stringify(settings);
      
      db.prepare(`
        INSERT INTO app_settings (id, settings, updated_at)
        VALUES (1, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          settings = excluded.settings,
          updated_at = CURRENT_TIMESTAMP
      `).run(settingsJson);
    } catch (error) {
      console.error('Failed to save app settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  static getAIProvider(): AppSettings['aiProvider'] {
    const settings = this.getSettings();
    let result = settings.aiProvider || this.getDefaultSettings().aiProvider;
    
    // Check if saved provider requires an API key that's missing
    if (result?.provider === 'gemini') {
      const hasGeminiKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
      if (!hasGeminiKey) {
        console.warn('⚠️ Gemini provider selected but API key not configured, falling back to Ollama');
        result.provider = 'ollama';
        result.model = 'llama3';
        this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
      }
    }
    
    if (result?.provider === 'openai') {
      const hasOpenAIKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
      if (!hasOpenAIKey) {
        console.warn('⚠️ OpenAI provider selected but API key not configured, falling back to Ollama');
        result.provider = 'ollama';
        result.model = 'llama3';
        this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
      }
    }
    
    // Auto-migrate deprecated Gemini models to current version
    if (result?.model === 'gemini-1.5-flash' || result?.model === 'gemini-1.5-pro') {
      console.log('🔄 Auto-migrating deprecated Gemini model:', result.model, '→ gemini-2.5-flash');
      result.model = 'gemini-2.5-flash';
      this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
    }
    
    return result;
  }

  static saveAIProvider(provider: string, model: string, ollamaBaseUrl?: string): void {
    const settings = this.getSettings();
    settings.aiProvider = {
      provider: provider as 'openai' | 'ollama' | 'gemini',
      model,
      ...(ollamaBaseUrl && { ollamaBaseUrl })
    };
    this.saveSettings(settings);
  }
}
