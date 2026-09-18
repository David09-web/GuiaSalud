import { Pool } from 'pg';
import { ENV } from './env';

export const dbPool = new Pool({
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  database: ENV.DB.NAME,
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  ssl: ENV.DB.SSL ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const testDbConnection = async (): Promise<boolean> => {
  try {
    const client = await dbPool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ [PostgreSQL] Conexión a Base de Datos exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.warn('⚠️ [PostgreSQL] Modo Offline/Fallback activado (BD no conectada en este entorno).');
    return false;
  }
};
