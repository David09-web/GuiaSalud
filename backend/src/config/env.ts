import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '5432', 10),
    NAME: process.env.DB_NAME || 'guiasalud_db',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'postgres',
    SSL: process.env.DB_SSL === 'true',
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_key_guiasalud_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    SECRET_2FA: process.env.JWT_2FA_SECRET || 'dev_2fa_secret_key_guiasalud_2026',
  },
  ENCRYPTION: {
    KEY: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  },
  CORS_ORIGIN: (process.env.CORS_ORIGIN || '*').split(','),
};
