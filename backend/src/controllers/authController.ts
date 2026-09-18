import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email y contraseña requeridos' });
        return;
      }
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async verify2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tempToken, twoFactorCode } = req.body;
      if (!tempToken || !twoFactorCode) {
        res.status(400).json({ error: 'tempToken y twoFactorCode son obligatorios' });
        return;
      }
      const result = await AuthService.verify2FA(tempToken, twoFactorCode);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
