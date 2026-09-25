-- ============================================================================
-- GUIASALUD v1.0 - MIGRACIÓN BASE DE DATOS POSTGRESQL
-- ============================================================================
-- Módulo de Autenticación y Seguridad 2FA + Módulo 4: Perfil del Usuario
-- Responsable Backend: David Marcet Ospina
-- Fecha: Septiembre 2026
-- ============================================================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA: users (Autenticación y Seguridad 2FA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'PATIENT' CHECK (role IN ('PATIENT', 'FAMILY', 'ADMIN')),
  patient_id      UUID REFERENCES users(id) ON DELETE SET NULL,

  -- 2FA TOTP (Autenticación de Doble Factor)
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  two_factor_secret  VARCHAR(255),

  -- Consentimiento Habeas Data (Ley 1581/2012)
  data_consent_granted BOOLEAN NOT NULL DEFAULT false,
  data_consent_date    TIMESTAMPTZ,

  -- Metadatos
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- TABLA: user_profiles (Módulo 4 - Perfil del Usuario)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Datos Personales
  first_name        VARCHAR(60),
  last_name         VARCHAR(60),
  id_type           VARCHAR(10) DEFAULT 'CC' CHECK (id_type IN ('CC', 'TI', 'CE', 'PPT', 'NIT')),
  id_number         VARCHAR(20),
  birth_date        DATE,
  gender            VARCHAR(20),
  address           VARCHAR(255),
  city              VARCHAR(80),
  department        VARCHAR(80),
  phone             VARCHAR(30),
  blood_type        VARCHAR(5) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),

  -- Datos de Afiliación EPS/IPS (SGSSS Colombia)
  eps_name          VARCHAR(120),
  eps_regime        VARCHAR(30) DEFAULT 'Contributivo' CHECK (eps_regime IN ('Contributivo', 'Subsidiado', 'Excepción', 'Especial')),
  ips_name          VARCHAR(120),
  affiliation_status VARCHAR(20) DEFAULT 'Activo' CHECK (affiliation_status IN ('Activo', 'Inactivo', 'Suspendido')),

  -- Datos Clínicos Básicos
  allergies         TEXT[] DEFAULT '{}',
  conditions        TEXT[] DEFAULT '{}',
  surgeries         TEXT[] DEFAULT '{}',

  -- Metadatos
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- TABLA: emergency_contacts (Contactos de Emergencia del Perfil)
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(120) NOT NULL,
  relation          VARCHAR(60) NOT NULL,
  phone             VARCHAR(30) NOT NULL,
  email             VARCHAR(255),
  is_primary        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_user_id ON emergency_contacts(user_id);

-- ============================================================================
-- TABLA: audit_logs (Registro Auditor de Seguridad - OMS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type      VARCHAR(80) NOT NULL,
  user_id         UUID REFERENCES users(id),
  user_role       VARCHAR(20),
  ip_address      VARCHAR(60) NOT NULL DEFAULT '0.0.0.0',
  status          VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'WARNING', 'CRITICAL', 'DENIED')),
  details         TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);

-- ============================================================================
-- FUNCIÓN: auto_update_updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED: Usuarios demo para demostración académica FET
-- ============================================================================
-- Contraseña demo: 'GuiaSalud2026!' (bcrypt hash generado)
-- NOTA: En producción usar contraseñas únicas y hash real

INSERT INTO users (id, name, email, password_hash, role, two_factor_enabled, data_consent_granted, data_consent_date)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'María Rodríguez', 'maria.rodriguez@gmail.com',
   '$2a$12$LJ3M4xQkTlv8Jv0qFXTOYO5Lx2FVbGJ0m7H2XsVnKqEZjzJfXqKC', 'PATIENT', true, true, NOW()),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Carlos Rodríguez (Familiar)', 'carlos.rodriguez@gmail.com',
   '$2a$12$LJ3M4xQkTlv8Jv0qFXTOYO5Lx2FVbGJ0m7H2XsVnKqEZjzJfXqKC', 'FAMILY', false, true, NOW()),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Ing. David Marcet (Admin FET)', 'admin.fet@guiasalud.edu.co',
   '$2a$12$LJ3M4xQkTlv8Jv0qFXTOYO5Lx2FVbGJ0m7H2XsVnKqEZjzJfXqKC', 'ADMIN', true, true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Vincular familiar con paciente
UPDATE users SET patient_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';

-- Perfil de María Rodríguez
INSERT INTO user_profiles (user_id, first_name, last_name, id_type, id_number, birth_date, gender, address, city, department, phone, blood_type, eps_name, eps_regime, ips_name, allergies, conditions, surgeries)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'María', 'Rodríguez', 'CC', '1.024.567.890', '1988-03-15', 'Femenino',
   'Calle 45 # 23-67', 'Bogotá D.C.', 'Cundinamarca', '+57 320 456 7890', 'O+',
   'Sanitas EPS', 'Contributivo', 'Centro Médico El Bosque',
   ARRAY['Penicilina (Anafilaxia leve)', 'Aspirina / AINEs', 'Látex'],
   ARRAY['Hipertensión arterial esencial (I10 - Controlada)', 'Diabetes mellitus tipo 2 (E11.9 - En manejo farmacológico)'],
   ARRAY['Apendicectomía por laparoscopia (2018)', 'Cesárea electiva (2015)'])
ON CONFLICT (user_id) DO NOTHING;

-- Contacto de emergencia de María
INSERT INTO emergency_contacts (user_id, name, relation, phone, is_primary)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos Rodríguez', 'Hermano (Cuidador principal)', '+57 310 234 5678', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
