import { CorsOptions } from 'cors';

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080'
];

function isReplitOrigin(origin: string): boolean {
  return origin.includes('.replit.dev') || origin.includes('.repl.co');
}

function isLocalOrigin(origin: string): boolean {
  return origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
}

function buildProductionAllowedOrigins(): string[] {
  const allowedOrigins: string[] = [];

  if (process.env.REPLIT_DEV_DOMAIN) {
    allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }

  if (process.env.ALLOWED_ORIGINS) {
    const customOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    allowedOrigins.push(...customOrigins);
  }

  return allowedOrigins;
}

function isProductionOriginAllowed(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void {
  if (!origin) {
    return callback(null, true);
  }

  const allowedOrigins = buildProductionAllowedOrigins();

  if (allowedOrigins.length === 0) {
    if (isReplitOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS: No explicit origins configured. Allowing origin: ${origin}. Consider setting ALLOWED_ORIGINS environment variable.`);
    return callback(null, true);
  }

  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'), false);
}

function isDevelopmentOriginAllowed(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void {
  if (!origin) {
    return callback(null, true);
  }

  if (DEV_ORIGINS.includes(origin) || isLocalOrigin(origin) || isReplitOrigin(origin)) {
    return callback(null, true);
  }

  console.warn(`CORS: Blocked origin in development: ${origin}`);
  return callback(new Error('Not allowed by CORS in development'), false);
}

export function getCorsOptions(): CorsOptions {
  return {
    origin: (origin, callback) => {
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        isProductionOriginAllowed(origin, callback);
      } else {
        isDevelopmentOriginAllowed(origin, callback);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  };
}
