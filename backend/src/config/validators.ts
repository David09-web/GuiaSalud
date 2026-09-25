import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE VALIDACIÓN ZOD - AUTENTICACIÓN Y PERFIL DE USUARIO
// ============================================================================

// --- Autenticación ---

export const RegisterSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(120),
  email: z.string().email('Correo electrónico inválido').max(255),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  role: z.enum(['PATIENT', 'FAMILY', 'ADMIN']).default('PATIENT'),
  patientId: z.string().uuid().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const Verify2FASchema = z.object({
  tempToken: z.string().min(1, 'El token temporal es obligatorio'),
  twoFactorCode: z.string().length(6, 'El código 2FA debe tener exactamente 6 dígitos'),
});

export const Enable2FASchema = z.object({
  password: z.string().min(1, 'La contraseña es obligatoria para activar 2FA'),
});

export const Verify2FASetupSchema = z.object({
  token: z.string().length(6, 'El código de verificación debe tener 6 dígitos'),
});

// --- Perfil de Usuario ---

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(60).optional(),
  lastName: z.string().min(1).max(60).optional(),
  idType: z.enum(['CC', 'TI', 'CE', 'PPT', 'NIT']).optional(),
  idNumber: z.string().max(20).optional(),
  birthDate: z.string().optional(),
  gender: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(80).optional(),
  department: z.string().max(80).optional(),
  phone: z.string().max(30).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  surgeries: z.array(z.string()).optional(),
});

export const UpdateAffiliationSchema = z.object({
  epsName: z.string().max(120).optional(),
  epsRegime: z.enum(['Contributivo', 'Subsidiado', 'Excepción', 'Especial']).optional(),
  ipsName: z.string().max(120).optional(),
  affiliationStatus: z.enum(['Activo', 'Inactivo', 'Suspendido']).optional(),
});

// --- Contactos de Emergencia ---

export const CreateEmergencyContactSchema = z.object({
  name: z.string().min(2, 'El nombre del contacto es obligatorio').max(120),
  relation: z.string().min(2, 'La relación/parentesco es obligatoria').max(60),
  phone: z.string().min(7, 'Número de teléfono inválido').max(30),
  email: z.string().email().max(255).optional().or(z.literal('')),
  isPrimary: z.boolean().default(false),
});

export const UpdateEmergencyContactSchema = CreateEmergencyContactSchema.partial();

// --- Tipos derivados de los esquemas ---
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type Verify2FAInput = z.infer<typeof Verify2FASchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateAffiliationInput = z.infer<typeof UpdateAffiliationSchema>;
export type CreateEmergencyContactInput = z.infer<typeof CreateEmergencyContactSchema>;
export type UpdateEmergencyContactInput = z.infer<typeof UpdateEmergencyContactSchema>;
