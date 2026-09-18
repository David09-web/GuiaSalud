import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { auditLoggerMiddleware } from './middlewares/auditLogger';
import { ENV } from './config/env';

export const createApp = (): Application => {
  const app = express();

  // Middlewares de seguridad y observabilidad
  app.use(helmet());
  app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Middleware de auditoría
  app.use(auditLoggerMiddleware);

  // Rutas principales
  app.use(ENV.API_PREFIX, routes);

  // Ruta raíz de bienvenida
  app.get('/', (_req, res) => {
    res.json({
      message: 'Bienvenido a la API REST Oficial de GuiaSalud v1.0',
      documentation: '/docs/API_REST_SPECIFICATION.md',
      health: `${ENV.API_PREFIX}/health`,
    });
  });

  // Manejo centralizado de errores
  app.use(errorHandler);

  return app;
};
