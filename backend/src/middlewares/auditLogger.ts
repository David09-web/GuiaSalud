import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { AuditLogEntry } from '../types';

export const auditLogs: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-17T20:15:00Z',
    eventType: 'AUTH_LOGIN_SUCCESS_2FA',
    userId: 'usr-001',
    userRole: 'PATIENT',
    ipAddress: '190.27.12.85 (Neiva, Huila)',
    status: 'SUCCESS',
    details: 'Inicio de sesión verificado con token 2FA.',
  },
  {
    id: 'log-002',
    timestamp: '2026-09-17T20:45:00Z',
    eventType: 'CLINICAL_VAULT_DECRYPT',
    userId: 'usr-001',
    userRole: 'PATIENT',
    ipAddress: '190.27.12.85 (Neiva, Huila)',
    status: 'SUCCESS',
    details: 'Descifrado AES-256 de examen de laboratorio (Hemograma).',
  },
];

export const auditLoggerMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api/v1/clinical-history') || req.path.startsWith('/api/v1/auth')) {
      const entry: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: `HTTP_${req.method}_${req.path.replace(/\//g, '_')}`,
        userId: req.user?.id,
        userRole: req.user?.role,
        ipAddress: req.ip || '127.0.0.1',
        status: res.statusCode < 400 ? 'SUCCESS' : 'WARNING',
        details: `Status ${res.statusCode} en ${duration}ms`,
      };
      auditLogs.unshift(entry);
    }
  });

  next();
};
