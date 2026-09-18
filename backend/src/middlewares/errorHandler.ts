import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || (err.message.includes('no encontrada') ? 404 : 400);
  console.error(`❌ [Error Handler ${statusCode}]:`, err.message || err);

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error en la petición',
    message: err.message || 'Ha ocurrido un error inesperado.',
    timestamp: new Date().toISOString(),
  });
};
