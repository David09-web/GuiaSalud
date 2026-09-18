import { Request, Response, NextFunction } from 'express';
import { auditLogs } from '../middlewares/auditLogger';
import { SGSSSTutorial } from '../types';

export class AdminController {
  private static tutorials: SGSSSTutorial[] = [
    {
      id: 'tut-001',
      title: 'Consultar Estado de Afiliación BDUA / ADRES',
      entityName: 'ADRES / MinSalud',
      officialUrl: 'https://www.adres.gov.co/consulte-su-eps',
      steps: [
        { stepNumber: 1, title: 'Ingresar al portal', instruction: 'Accede al enlace oficial de consulta BDUA de ADRES.' },
        { stepNumber: 2, title: 'Seleccionar documento', instruction: 'Elige Cédula de Ciudadanía y digita tu número.' },
        { stepNumber: 3, title: 'Descargar certificado', instruction: 'Verifica el estado ACTIVO y genera el soporte en PDF.' },
      ],
    },
    {
      id: 'tut-002',
      title: 'Radicación de Autorizaciones Médicas EPS Sanitas',
      entityName: 'EPS Sanitas',
      officialUrl: 'https://www.epssanitas.com',
      steps: [
        { stepNumber: 1, title: 'Ingreso a Oficina Virtual', instruction: 'Inicia sesión con usuario y clave en la web o app.' },
        { stepNumber: 2, title: 'Adjuntar Orden Médica', instruction: 'Sube la foto o PDF claro de la orden e historia clínica.' },
        { stepNumber: 3, title: 'Número de Radicado', instruction: 'Guarda el número de radicado para seguimiento en 5 días hábiles.' },
      ],
    },
  ];

  public static async getTutorials(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(AdminController.tutorials);
    } catch (err) {
      next(err);
    }
  }

  public static async createTutorial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, entityName, officialUrl, steps } = req.body;
      const newTut: SGSSSTutorial = {
        id: `tut-${Date.now().toString().slice(-4)}`,
        title,
        entityName,
        officialUrl,
        steps: steps || [],
      };
      AdminController.tutorials.push(newTut);
      res.status(201).json(newTut);
    } catch (err) {
      next(err);
    }
  }

  public static async getAuditLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(auditLogs);
    } catch (err) {
      next(err);
    }
  }
}
