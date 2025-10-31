import { z } from 'zod';

/**
 * Environment Configuration with Zod Validation
 * 
 * This module provides type-safe environment variable access with runtime validation.
 * All environment variables are validated on server startup.
 * 
 * Usage:
 * ```typescript
 * import { env } from './config/env';
 * 
 * const port = env.PORT;
 * const apiKey = env.GEMINI_API_KEY;
 * ```
 */

const envSchema = z.object({
  // Application Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Server Configuration
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, {
      message: 'PORT must be between 1 and 65535',
    }),

  // Database Configuration
  DATABASE_PATH: z
    .string()
    .default('./database.db')
    .describe('Path to SQLite database file'),

  // Security & Session
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters')
    .optional()
    .default('dev-session-secret-change-in-production'),

  ENCRYPTION_KEY: z
    .string()
    .min(32, 'ENCRYPTION_KEY must be at least 32 characters')
    .optional()
    .default('dev-encryption-key-change-in-production'),

  // AI Provider Configuration (all optional)
  OPENAI_API_KEY: z
    .string()
    .optional()
    .describe('OpenAI API key for GPT models'),

  GEMINI_API_KEY: z
    .string()
    .optional()
    .describe('Google Gemini API key'),

  OLLAMA_BASE_URL: z
    .string()
    .url()
    .optional()
    .default('http://localhost:11434')
    .describe('Ollama server base URL'),

  // CORS & Security
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((val) => val?.split(',').map((origin) => origin.trim()))
    .describe('Comma-separated list of allowed CORS origins'),

  // Development & Testing
  PING_MESSAGE: z
    .string()
    .optional()
    .default('pong')
    .describe('Test ping response message'),

  // Optional Features
  MAX_FILE_SIZE_MB: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10)),

  RATE_LIMIT_PER_MINUTE: z
    .string()
    .optional()
    .default('100')
    .transform((val) => parseInt(val, 10)),
});

/**
 * Validated environment variables
 * 
 * This object contains all environment variables with proper types and defaults.
 * The values are validated on module initialization.
 */
export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    console.error(JSON.stringify(error.errors, null, 2));
    console.error('\n💡 Please check your .env file against .env.example');
    process.exit(1);
  }
  throw error;
}

/**
 * Production environment checks and warnings
 */
if (env.NODE_ENV === 'production') {
  // Warn about default secrets in production
  if (env.SESSION_SECRET.startsWith('dev-')) {
    console.warn('⚠️  WARNING: Using default SESSION_SECRET in production!');
    console.warn('   Generate a secure secret with: openssl rand -base64 32');
  }

  if (env.ENCRYPTION_KEY.startsWith('dev-')) {
    console.warn('⚠️  WARNING: Using default ENCRYPTION_KEY in production!');
    console.warn('   Generate a secure key with: openssl rand -base64 32');
  }

  // Warn if no AI provider is configured
  if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
    console.warn('⚠️  WARNING: No AI provider API key configured!');
    console.warn('   AI features will only work with Ollama (local AI).');
  }
}

/**
 * Development environment info
 */
if (env.NODE_ENV === 'development') {
  console.log('🔧 Development Environment Configuration:');
  console.log(`   NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   PORT: ${env.PORT}`);
  console.log(`   DATABASE_PATH: ${env.DATABASE_PATH}`);
  console.log(`   OPENAI_API_KEY: ${env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   GEMINI_API_KEY: ${env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   OLLAMA_BASE_URL: ${env.OLLAMA_BASE_URL}`);
}

export { env };
