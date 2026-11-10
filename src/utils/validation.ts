/**
 * Reglas de Validación de GuiaSalud
 *
 * Módulos y Formularios del Sistema:
 * 1. Nombres Propios y Parentescos (Sin dígitos, sin teclado aleatorio / gibberish)
 * 2. Campos Numéricos y Telefónicos (Estrictos, bloqueo de letras)
 * 3. Campos Médicos y Direcciones (Prevención de texto basura y verificación de estructura)
 * 4. Selectores de Fecha y Horarios (Restricciones lógicas temporales y biológicas)
 * 5. Credenciales y Cuentas (Correo con dominio válido, contraseña robusta)
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 32;
export const PASSWORD_HAS_NUMBER_REGEX = /[0-9]/;

// Teclas y secuencias habituales de mashing / tecleo aleatorio
const KEYBOARD_WALK_PATTERNS = [
  /asdf/i,
  /qwer/i,
  /zxcv/i,
  /hjkl/i,
  /12345/,
  /qazwsx/i,
  /poiuy/i,
  /lkjh/i,
  /mnbvc/i,
];

// Nomenclaturas habituales de direcciones en Colombia
const ADDRESS_KEYWORDS_REGEX =
  /\b(calle|cra|carrera|cll|cl|kr|av|avenida|diag|diagonal|dg|transv|transversal|tv|manzana|mz|vereda|km|kilometro|kilómetro|casa|apto|apartamento|torre|bloque|interior|lote|barrio|sector|piso|autopista|circular|callej[oó]n)\b/i;

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  isProvided: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  lengthValid: boolean;
  hasNumber: boolean;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// UTILIDADES AUXILIARES DE FECHA
// ============================================================================

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD según hora local
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna la fecha máxima permitida para agendamiento (1 año en el futuro)
 */
export function getMaxAppointmentDateString(): string {
  const now = new Date();
  now.setDate(now.getDate() + 365);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna la fecha mínima permitida biológicamente (125 años atrás o 1900-01-01)
 */
export function getMinBirthDateString(): string {
  return '1900-01-01';
}

// ============================================================================
// DETECCIÓN DE TEXTO BASURA / TECLADO ALEATORIO (ANTI-GIBBERISH)
// ============================================================================

/**
 * Evalúa si una cadena de texto parece haber sido generada mediante teclado aleatorio
 * o pruebas inválidas (repeticiones extremas, falta de vocales, secuencias qwerty, etc.).
 */
export function isGibberishText(text: string): { isGibberish: boolean; reason?: string } {
  const clean = (text || '').trim();
  if (!clean) return { isGibberish: false };

  // 1. Caracteres idénticos repetidos 3 o más veces consecutivas (ej: "aaaaa", "zzzz", "....")
  if (/(.)\1{2,}/i.test(clean)) {
    return {
      isGibberish: true,
      reason: 'El texto contiene caracteres idénticos repetidos de forma consecutiva (ej: aaa, zzz).',
    };
  }

  // 2. Secuencias típicas de caminatas sobre el teclado (ej: asdf, qwer, zxcv)
  for (const pattern of KEYBOARD_WALK_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isGibberish: true,
        reason: 'Se detectó una secuencia aleatoria de teclado (ej: asdf, qwer, 12345).',
      };
    }
  }

  // 3. Palabras de 4 o más letras sin ninguna vocal (en español/médico toda palabra tiene vocales)
  // Se exceptúan siglas o abreviaturas muy conocidas de 2-3 letras como "Dr", "Dra", "EPS", "IPS", "CC", "RH".
  const words = clean.split(/\s+/);
  for (const word of words) {
    const lettersOnly = word.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '');
    if (lettersOnly.length >= 4) {
      const hasVowel = /[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/i.test(lettersOnly);
      if (!hasVowel) {
        return {
          isGibberish: true,
          reason: `La palabra "${word}" carece de vocales válidas y parece ser texto aleatorio.`,
        };
      }
      // 4. Clúster de 5 o más consonantes seguidas
      if (/[bcdfghjklmnñpqrstvwxyz]{5,}/i.test(lettersOnly)) {
        return {
          isGibberish: true,
          reason: `La palabra "${word}" contiene una combinación inusual de consonantes consecutivas.`,
        };
      }
    }
  }

  // 5. Baja entropía / repetición de patrón de 2 caracteres en texto largo (ej: "abababab", "qwqwqw")
  if (clean.length >= 8) {
    const uniqueChars = new Set(clean.toLowerCase().replace(/\s/g, ''));
    if (uniqueChars.size <= 2) {
      return {
        isGibberish: true,
        reason: 'El texto no contiene suficiente diversidad de caracteres y parece ser una repetición de prueba.',
      };
    }
  }

  return { isGibberish: false };
}

// ============================================================================
// 1. VALIDACIÓN ESTRICTA: NOMBRES PROPIOS, DOCTORES Y PARENTESCOS
// ============================================================================

/**
 * Valida nombres completos de personas (pacientes, contactos de emergencia, cuidadores).
 * - PROHÍBE estrictamente dígitos numéricos (ej: rechaza "Admin 123123123" o "jkhjb23jb").
 * - Solo admite letras, tildes, diéresis, espacios, guiones y puntos legítimos.
 * - Longitud: 3 a 70 caracteres.
 * - Validación anti-gibberish.
 */
export function validatePersonName(
  name: string,
  fieldName = 'Nombre Completo',
  isRequired = true
): ValidationResult {
  const clean = (name || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: `${fieldName}: El campo es obligatorio.` };
    }
    return { isValid: true };
  }

  // 1. Prohibición estricta de números
  if (/\d/.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: No se permiten números ni dígitos en nombres propios (ej: evita "Admin 123" o combinaciones numéricas).`,
    };
  }

  // 2. Longitud
  if (clean.length < 3 || clean.length > 70) {
    return {
      isValid: false,
      error: `${fieldName}: Debe tener entre 3 y 70 caracteres (actual: ${clean.length}).`,
    };
  }

  // 3. Caracteres alfabéticos permitidos en español
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: Solo se permiten letras, tildes y espacios. No se permiten caracteres especiales (!@#$%^&*).`,
    };
  }

  // 4. Verificación anti-gibberish
  const gibberishCheck = isGibberishText(clean);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      error: `${fieldName}: ${gibberishCheck.reason}`,
    };
  }

  return { isValid: true };
}

/**
 * Valida nombres de profesionales médicos o especialistas.
 * - Bloquea números.
 * - Admite prefijos como "Dr.", "Dra.", etc.
 * - Longitud: 4 a 60 caracteres.
 */
export function validateDoctorName(
  name: string,
  fieldName = 'Profesional médico',
  isRequired = true
): ValidationResult {
  const clean = (name || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: `${fieldName}: El campo es obligatorio.` };
    }
    return { isValid: true };
  }

  if (/\d/.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: No se permiten números en nombres de profesionales médicos.`,
    };
  }

  if (clean.length < 4 || clean.length > 60) {
    return {
      isValid: false,
      error: `${fieldName}: Debe tener entre 4 y 60 caracteres.`,
    };
  }

  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: Solo se permiten letras y espacios (ej: Dr. Andrés Morales).`,
    };
  }

  const gibberishCheck = isGibberishText(clean);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      error: `${fieldName}: ${gibberishCheck.reason}`,
    };
  }

  return { isValid: true };
}

/**
 * Valida parentescos o relaciones familiares (ej: "Madre", "Hijo", "Hermano", "Cónyuge", "Cuidador").
 * - Bloquea estrictamente números y caracteres no alfabéticos.
 * - Longitud: 3 a 40 caracteres.
 */
export function validateRelationship(
  relation: string,
  fieldName = 'Parentesco / Relación',
  isRequired = true
): ValidationResult {
  const clean = (relation || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: `${fieldName}: El campo es obligatorio.` };
    }
    return { isValid: true };
  }

  if (/\d/.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: No se permiten números en el parentesco o relación.`,
    };
  }

  if (clean.length < 3 || clean.length > 40) {
    return {
      isValid: false,
      error: `${fieldName}: Debe tener entre 3 y 40 caracteres.`,
    };
  }

  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s/()-]+$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: Solo se permiten letras y espacios (ej: Hijo(a), Madre, Hermano, Cónyuge).`,
    };
  }

  const gibberishCheck = isGibberishText(clean);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      error: `${fieldName}: ${gibberishCheck.reason}`,
    };
  }

  return { isValid: true };
}

/**
 * Alias retrocompatible para especialidad o textos médicos alfabéticos
 */
export function validateMedicalText(
  value: string,
  fieldName: 'Especialidad médica' | 'Profesional médico'
): ValidationResult {
  if (fieldName === 'Profesional médico') {
    return validateDoctorName(value, fieldName, true);
  }
  const clean = (value || '').trim();
  if (!clean) {
    return { isValid: false, error: `${fieldName}: El campo es obligatorio.` };
  }
  if (clean.length < 4 || clean.length > 60) {
    return {
      isValid: false,
      error: `${fieldName}: Debe tener entre 4 y 60 caracteres.`,
    };
  }
  if (/\d/.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: No se permiten números en este campo.`,
    };
  }
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.]+$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: Solo se permite texto alfabético y espacios.`,
    };
  }
  const gibberish = isGibberishText(clean);
  if (gibberish.isGibberish) {
    return { isValid: false, error: `${fieldName}: ${gibberish.reason}` };
  }
  return { isValid: true };
}

// ============================================================================
// 2. VALIDACIÓN ESTRICTA: CAMPOS NUMÉRICOS Y TELEFÓNICOS
// ============================================================================

/**
 * Valida números de teléfono móvil en Colombia.
 * - Bloquea TERMINANTEMENTE letras (ej: "2234iuhui..." es rechazado al instante).
 * - Admite caracteres de marcado estándar (+, espacios, guiones).
 * - Exige exactamente 10 dígitos numéricos e inicio con dígito 3 (ej: 3101234567 o +57 3101234567).
 */
export function validateColombiaPhone(
  phone: string,
  fieldName = 'Teléfono Móvil',
  isRequired = true
): ValidationResult {
  const clean = (phone || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: `${fieldName}: El número de teléfono es obligatorio.` };
    }
    return { isValid: true };
  }

  // 1. Bloqueo terminante de letras
  if (/[a-zA-Z]/.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: No se permiten letras en campos telefónicos. Solo números y prefijo (+).`,
    };
  }

  // 2. Extraer únicamente dígitos
  const digitsOnly = clean.replace(/\D/g, '');

  let standard10 = digitsOnly;
  if (digitsOnly.length === 12 && digitsOnly.startsWith('57')) {
    standard10 = digitsOnly.slice(2);
  }

  if (standard10.length !== 10) {
    return {
      isValid: false,
      error: `${fieldName}: Debe tener exactamente 10 dígitos numéricos (para Colombia, ej: 3101234567). Ingresados: ${standard10.length} dígitos.`,
    };
  }

  if (!standard10.startsWith('3')) {
    return {
      isValid: false,
      error: `${fieldName}: Los números celulares en Colombia deben iniciar con 3 (ej: 3101234567).`,
    };
  }

  return { isValid: true };
}

/**
 * Valida que el documento de identidad contenga únicamente dígitos numéricos (6 a 12 dígitos).
 * Bloquea cualquier letra o símbolo.
 */
export function validateIdNumber(idNumber: string): ValidationResult {
  const clean = (idNumber || '').trim();
  if (!clean) {
    return { isValid: false, error: 'Por favor ingresa tu documento de identidad.' };
  }
  if (/[a-zA-Z]/.test(clean)) {
    return {
      isValid: false,
      error: 'El documento de identidad debe contener únicamente números, sin letras ni símbolos.',
    };
  }
  if (!/^\d+$/.test(clean)) {
    return {
      isValid: false,
      error: 'El documento de identidad no puede tener símbolos ni caracteres especiales.',
    };
  }
  if (clean.length < 6 || clean.length > 12) {
    return {
      isValid: false,
      error: 'El documento de identidad debe tener entre 6 y 12 dígitos.',
    };
  }
  return { isValid: true };
}

// ============================================================================
// 3. VALIDACIÓN ESTRICTA: CAMPOS MÉDICOS Y DIRECCIONES
// ============================================================================

/**
 * Valida direcciones de residencia colombianas o estándar.
 * - Evita texto basura / aleatorio (ej: "asdfghjk", "123123123", "sdjfksldjfkl").
 * - Requiere longitud entre 6 y 100 caracteres.
 * - Debe contener una estructura coherente (nomenclatura de calle/carrera o palabras con número).
 */
export function validateAddress(
  address: string,
  isRequired = false,
  fieldName = 'Dirección de Residencia'
): ValidationResult {
  const clean = (address || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: `${fieldName}: La dirección es obligatoria.` };
    }
    return { isValid: true };
  }

  if (clean.length < 6 || clean.length > 100) {
    return {
      isValid: false,
      error: `${fieldName}: Debe tener entre 6 y 100 caracteres (actual: ${clean.length}).`,
    };
  }

  // 1. No puede ser exclusivamente números
  if (/^\d+$/.test(clean.replace(/[\s.,#-]/g, ''))) {
    return {
      isValid: false,
      error: `${fieldName}: La dirección debe incluir nomenclatura o nombre de vía (ej: Calle 123 # 45-67), no solo números.`,
    };
  }

  // 2. Detección anti-gibberish
  const gibberishCheck = isGibberishText(clean);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      error: `${fieldName}: ${gibberishCheck.reason}`,
    };
  }

  // 3. Coherencia de dirección: debe tener al menos una letra y un número, o una palabra clave de dirección
  const hasLetter = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/i.test(clean);
  const hasDigit = /\d/.test(clean);
  const hasKeyword = ADDRESS_KEYWORDS_REGEX.test(clean);

  if (!hasKeyword && (!hasLetter || !hasDigit)) {
    return {
      isValid: false,
      error: `${fieldName}: Ingresa una dirección válida con nomenclatura y número (ej: Calle 45 # 12-34 o Vereda El Salitre Casa 2).`,
    };
  }

  return { isValid: true };
}

/**
 * Valida descripciones clínicas (Alergias, Condiciones Crónicas, Cirugías Previas, Diagnósticos, Procedimientos).
 * - Longitud: 5 a 300 caracteres.
 * - Alfanumérico con signos de puntuación básicos.
 * - Rechaza terminantemente cadenas aleatorias de teclado (ej: "asdfghjk", "qwerqwer", "123123123").
 */
export function validateClinicalDescription(
  value: string,
  fieldName: 'Alergias' | 'Antecedentes' | 'Diagnóstico' | 'Procedimiento' = 'Alergias',
  isRequired: boolean = true
): ValidationResult {
  const clean = (value || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: `${fieldName}: El campo es obligatorio.` };
    }
    return { isValid: true };
  }

  if (clean.length < 5 || clean.length > 300) {
    return {
      isValid: false,
      error: `${fieldName}: Debe tener entre 5 y 300 caracteres (actual: ${clean.length}).`,
    };
  }

  // No permitir cadenas puramente numéricas para diagnósticos o alergias
  if (/^\d+$/.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: No puede consistir únicamente en números. Describe la patología o medicamento.`,
    };
  }

  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:()#/\-+]+$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName}: Solo se permiten caracteres alfanuméricos y puntuación básica (puntos, comas, guiones).`,
    };
  }

  // Verificación anti-gibberish
  const gibberishCheck = isGibberishText(clean);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      error: `${fieldName}: ${gibberishCheck.reason}`,
    };
  }

  return { isValid: true };
}

/**
 * Valida Sede / IPS
 * - Texto alfanumérico (letras, números y acentos).
 * - Longitud: 5 a 80 caracteres.
 */
export function validateHealthCenter(center: string): ValidationResult {
  const clean = (center || '').trim();
  if (!clean) {
    return { isValid: false, error: 'Sede / IPS: El campo es obligatorio.' };
  }
  if (clean.length < 5 || clean.length > 80) {
    return {
      isValid: false,
      error: `Sede / IPS: Debe tener entre 5 y 80 caracteres (actual: ${clean.length}).`,
    };
  }
  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#-]+$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      error: 'Sede / IPS: Solo se permite texto alfanumérico y signos de puntuación comunes.',
    };
  }
  const gibberishCheck = isGibberishText(clean);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      error: `Sede / IPS: ${gibberishCheck.reason}`,
    };
  }
  return { isValid: true };
}

/**
 * Valida Notas de Preparación / Motivo de la Cita
 * - 10 a 250 caracteres.
 * - Prevención XSS/SQL y texto basura.
 */
export function validateAppointmentNotes(notes: string, isRequired: boolean = false): ValidationResult {
  const clean = (notes || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: 'Notas / Motivo de la cita: El campo es obligatorio.' };
    }
    return { isValid: true };
  }

  if (clean.length < 10 || clean.length > 250) {
    return {
      isValid: false,
      error: `Notas / Motivo de la cita: Debe tener entre 10 y 250 caracteres (actual: ${clean.length}).`,
    };
  }

  const dangerousPatterns =
    /<script\b[^>]*>|<\/script>|javascript:|onload=|onerror=|\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|ALTER)\b\s+.*\b(FROM|INTO|TABLE)\b/i;
  if (dangerousPatterns.test(clean)) {
    return {
      isValid: false,
      error: 'Notas / Motivo de la cita: Se han detectado caracteres o instrucciones no permitidas (prevención de seguridad XSS/SQL).',
    };
  }

  const gibberishCheck = isGibberishText(clean);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      error: `Notas / Motivo de la cita: ${gibberishCheck.reason}`,
    };
  }

  return { isValid: true };
}

/**
 * Valida Nombre Comercial del Fármaco
 * - Alfanumérico con guiones y unidades (ej: Ibuprofeno-600, Losartán 50mg).
 * - Longitud: 3 a 50 caracteres.
 */
export function validateMedicationName(name: string): ValidationResult {
  const clean = (name || '').trim();
  if (!clean) {
    return { isValid: false, error: 'Nombre del fármaco: El campo es obligatorio.' };
  }
  if (clean.length < 3 || clean.length > 50) {
    return {
      isValid: false,
      error: `Nombre del fármaco: Debe tener entre 3 y 50 caracteres (actual: ${clean.length}).`,
    };
  }
  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      error: 'Nombre del fármaco: Solo se permiten letras, números y guiones (ej: Ibuprofeno-600).',
    };
  }
  const gibberishCheck = isGibberishText(clean);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      error: `Nombre del fármaco: ${gibberishCheck.reason}`,
    };
  }
  return { isValid: true };
}

/**
 * Valida Dosis / Presentación
 * - 2 a 30 caracteres.
 */
export function validateMedicationDose(dose: string): ValidationResult {
  const clean = (dose || '').trim();
  if (!clean) {
    return { isValid: false, error: 'Dosis / Presentación: El campo es obligatorio.' };
  }
  if (clean.length < 2 || clean.length > 30) {
    return {
      isValid: false,
      error: `Dosis / Presentación: Debe tener entre 2 y 30 caracteres (actual: ${clean.length}).`,
    };
  }
  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,/()-]+$/;
  if (!regex.test(clean)) {
    return {
      isValid: false,
      error: 'Dosis / Presentación: Solo se permite texto alfanumérico con unidades (ej: 500 mg, 1 pastilla, 10 ml).',
    };
  }
  return { isValid: true };
}

/**
 * Valida Frecuencia de Medicamento en horas
 * - Entero entre 1 y 24.
 */
export function validateMedicationFrequency(hours: number | string): ValidationResult {
  const num = typeof hours === 'number' ? hours : Number(String(hours).trim());
  if (isNaN(num)) {
    return { isValid: false, error: 'Frecuencia: Debe ser un valor numérico entero.' };
  }
  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Frecuencia: Debe ser un número entero sin decimales.' };
  }
  if (num < 1 || num > 24) {
    return {
      isValid: false,
      error: `Frecuencia: Debe ser entre 1 y 24 horas (ingresado: ${num}).`,
    };
  }
  return { isValid: true };
}

// ============================================================================
// 4. RESTRICCIONES EN SELECTORES DE FECHA Y HORARIOS
// ============================================================================

/**
 * Valida la fecha de nacimiento.
 * - No puede ser en el futuro ni posterior al día de hoy.
 * - No puede ser mayor al año actual ni a 2026.
 * - Límite biológico: No anterior a 1900-01-01 (edad máxima 125 años).
 */
export function validateBirthDate(birthDate: string): ValidationResult {
  if (!birthDate) return { isValid: true };

  const selected = new Date(birthDate + 'T00:00:00');
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  if (isNaN(selected.getTime())) {
    return { isValid: false, error: 'La fecha de nacimiento no es válida.' };
  }

  const currentYear = now.getFullYear();
  const selectedYear = selected.getFullYear();

  if (selectedYear > currentYear || selectedYear > 2026) {
    return {
      isValid: false,
      error: `La fecha de nacimiento no puede ser mayor al año actual (${currentYear}) ni a 2026.`,
    };
  }

  if (selected.getTime() > now.getTime()) {
    return {
      isValid: false,
      error: 'La fecha de nacimiento no puede ser posterior al día de hoy.',
    };
  }

  if (selectedYear < 1900 || selectedYear < currentYear - 125) {
    return {
      isValid: false,
      error: 'La fecha de nacimiento no puede ser anterior a 1900 (límite biológico).',
    };
  }

  return { isValid: true };
}

/**
 * Valida la fecha para agendar o reprogramar una cita médica.
 * - No puede ser en el pasado (debe ser hoy o posterior).
 * - No puede superar 1 año (365 días) en el futuro.
 */
export function validateAppointmentDate(dateStr: string): ValidationResult {
  const clean = (dateStr || '').trim();
  if (!clean) {
    return { isValid: false, error: 'La fecha de la cita es obligatoria.' };
  }

  const selected = new Date(clean + 'T00:00:00');
  if (isNaN(selected.getTime())) {
    return { isValid: false, error: 'La fecha ingresada para la cita no es válida.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected.getTime() < today.getTime()) {
    return {
      isValid: false,
      error: 'La fecha de la cita médica no puede ser en el pasado. Elige el día de hoy o una fecha futura.',
    };
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 365);
  maxDate.setHours(23, 59, 59, 999);

  if (selected.getTime() > maxDate.getTime()) {
    return {
      isValid: false,
      error: 'No es posible agendar citas con más de un año de anticipación.',
    };
  }

  return { isValid: true };
}

/**
 * Valida el horario de una cita médica.
 * - Debe estar dentro del horario de atención clínica: 06:00 a 20:00.
 */
export function validateAppointmentTime(timeStr: string): ValidationResult {
  const clean = (timeStr || '').trim();
  if (!clean) {
    return { isValid: false, error: 'La hora de la cita es obligatoria.' };
  }

  const match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return { isValid: false, error: 'El formato de hora no es válido (ej: 09:30 o 15:00).' };
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 6 || hours > 20 || (hours === 20 && minutes > 0)) {
    return {
      isValid: false,
      error: 'El horario de atención médica debe estar comprendido entre las 06:00 AM y las 08:00 PM.',
    };
  }

  return { isValid: true };
}

/**
 * Valida fechas históricas clínicas (antecedentes, diagnósticos, exámenes, procedimientos).
 * - No pueden ser fechas futuras (> hoy).
 * - No pueden ser anteriores a 1900.
 */
export function validateHistoricalDate(
  dateStr: string,
  fieldName = 'Fecha del registro'
): ValidationResult {
  if (!dateStr) return { isValid: true };

  const selected = new Date(dateStr + 'T00:00:00');
  if (isNaN(selected.getTime())) {
    return { isValid: false, error: `${fieldName}: Fecha no válida.` };
  }

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  if (selected.getTime() > now.getTime()) {
    return {
      isValid: false,
      error: `${fieldName}: La fecha de un registro histórico no puede ser posterior al día de hoy.`,
    };
  }

  if (selected.getFullYear() < 1900) {
    return {
      isValid: false,
      error: `${fieldName}: La fecha no puede ser anterior al año 1900.`,
    };
  }

  return { isValid: true };
}

// ============================================================================
// 5. VALIDACIÓN DE CREDENCIALES (CORREO Y CONTRASEÑA)
// ============================================================================

export function validateEmail(email: string, isRequired: boolean = false): EmailValidationResult {
  const clean = (email || '').trim().toLowerCase();

  if (!clean) {
    if (isRequired) {
      return {
        isValid: false,
        isProvided: false,
        error: 'El correo electrónico es obligatorio para este proceso.',
      };
    }
    return {
      isValid: true,
      isProvided: false,
    };
  }

  if (clean.length > 100) {
    return {
      isValid: false,
      isProvided: true,
      error: 'El correo electrónico no puede superar los 100 caracteres.',
    };
  }

  if (!EMAIL_REGEX.test(clean)) {
    return {
      isValid: false,
      isProvided: true,
      error: 'Formato de correo inválido. Debe cumplir con la estructura estándar (ej: usuario@gmail.com).',
    };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      isProvided: true,
      error: 'El correo debe contener exactamente un símbolo "@".',
    };
  }

  const [, domain] = parts;
  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts.some((p) => p.length === 0)) {
    return {
      isValid: false,
      isProvided: true,
      error: 'El dominio del correo debe tener un nombre y extensión válidos (ej: @gmail.com, @guiasalud.edu.co).',
    };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      isProvided: true,
      error: 'La extensión del dominio debe tener al menos 2 caracteres (ej: .com, .co).',
    };
  }

  return {
    isValid: true,
    isProvided: true,
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const pwd = password || '';
  const lengthValid = pwd.length >= PASSWORD_MIN_LENGTH && pwd.length <= PASSWORD_MAX_LENGTH;
  const hasNumber = PASSWORD_HAS_NUMBER_REGEX.test(pwd);

  let error: string | undefined = undefined;

  if (!lengthValid) {
    error = `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres.`;
  } else if (!hasNumber) {
    error = 'La contraseña debe incluir obligatoriamente al menos un número (0-9).';
  }

  return {
    isValid: lengthValid && hasNumber,
    lengthValid,
    hasNumber,
    error,
  };
}
