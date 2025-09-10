import { AppConfig } from '../types/index.js';

// Environment variable validation
const requiredEnvVars = {
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
} as const;

const validateEnvironment = (): void => {
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Validate environment on module load
validateEnvironment();

export const config: AppConfig = {
  port: parseInt(process.env.SERVER_PORT || '3000', 10),
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) || 'development',
  database: {
    url: `postgres://${requiredEnvVars.DB_USER}:${requiredEnvVars.DB_PASS}@${requiredEnvVars.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${requiredEnvVars.DB_NAME}`,
    options: {
      define: { underscored: true },
      logging:
        process.env.NODE_ENV === 'production'
          ? false
          : (sql: string) => {
              if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.log(sql);
              }
            },
      pool: {
        max: 5, // Reduced for Cloud Run
        min: 0, // Allow connections to close
        acquire: 30000,
        idle: 10000, // Close idle connections quickly
      },
      dialectOptions: {
        keepAlive: true,
        keepAliveInitialDelayMillis: 0,
      },
    },
  },
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'https://noita.ch',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

export default config;
