-- =====================================================================
-- PROYECTO: GuiaSalud Versión 1.0
-- PROGRAMA: Ingeniería de Software II - FET Neiva
-- DOCENTE (GESTOR): Miguel Antonio Urbano Silva
-- LÍDER BACKEND: David Marcet Ospina
-- MOTOR DE BASE DE DATOS: PostgreSQL 15+
-- MODELO ENTIDAD-RELACIÓN Y SCRIPT DDL
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. TABLA: roles
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL, -- 'PATIENT', 'FAMILY', 'ADMIN'
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (codigo, nombre, descripcion) VALUES
('PATIENT', 'Paciente / Usuario', 'Gestión de citas, recetas, historia clínica personal y trámites.'),
('FAMILY', 'Familiar Autorizado', 'Acceso delegado a citas, recordatorios y medicamentos de un familiar dependiente.'),
('ADMIN', 'Administrador', 'Gestión de contenidos, tutoriales, enlaces oficiales y monitoreo de auditoría sin acceso a HC.');

-- ---------------------------------------------------------------------
-- 2. TABLA: usuarios
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_rol INT NOT NULL REFERENCES roles(id_rol) ON DELETE RESTRICT,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    doble_factor_activo BOOLEAN DEFAULT TRUE,
    secret_2fa VARCHAR(64),
    consentimiento_datos BOOLEAN DEFAULT TRUE,
    fecha_consentimiento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. TABLA: perfiles_paciente
-- ---------------------------------------------------------------------
CREATE TABLE perfiles_paciente (
    id_perfil UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID UNIQUE NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(10) DEFAULT 'CC',
    numero_documento VARCHAR(30) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20),
    grupo_sanguineo VARCHAR(5) NOT NULL, -- 'O+', 'A+', 'B+', etc.
    telefono VARCHAR(25) NOT NULL,
    direccion TEXT,
    eps_afiliacion VARCHAR(100) NOT NULL,
    ips_primaria VARCHAR(150) NOT NULL,
    nombre_contacto_emergencia VARCHAR(150) NOT NULL,
    parentesco_contacto_emergencia VARCHAR(50) NOT NULL,
    telefono_contacto_emergencia VARCHAR(25) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. TABLA: familiares_autorizados (Delegación de Permisos)
-- ---------------------------------------------------------------------
CREATE TABLE familiares_autorizados (
    id_delegacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_paciente UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_familiar UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    parentesco VARCHAR(50) NOT NULL,
    permiso_ver_agenda BOOLEAN DEFAULT TRUE,
    permiso_ver_medicamentos BOOLEAN DEFAULT TRUE,
    permiso_ver_historia BOOLEAN DEFAULT FALSE,
    permiso_recibir_alertas BOOLEAN DEFAULT TRUE,
    estado VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'PENDING', 'REVOKED'
    fecha_autorizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_revocacion TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_paciente_familiar UNIQUE (id_paciente, id_familiar)
);

-- ---------------------------------------------------------------------
-- 5. TABLA: citas_medicas (Módulo 1)
-- ---------------------------------------------------------------------
CREATE TABLE citas_medicas (
    id_cita UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_paciente UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    medico_tratante VARCHAR(150) NOT NULL,
    centro_salud_ips VARCHAR(200) NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'DONE', 'CANCELLED'
    motivo_consulta TEXT,
    observaciones_preparacion TEXT,
    notificacion_enviada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_citas_paciente_fecha ON citas_medicas(id_paciente, fecha_cita);

-- ---------------------------------------------------------------------
-- 6. TABLA: medicamentos (Módulo 2)
-- ---------------------------------------------------------------------
CREATE TABLE medicamentos (
    id_medicamento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_paciente UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_generico_comercial VARCHAR(150) NOT NULL,
    dosis VARCHAR(50) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    duracion_dias INT NOT NULL,
    dias_transcurridos INT DEFAULT 0,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    medico_prescriptor VARCHAR(150),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 7. TABLA: registro_tomas_medicamento (Historial de Adherencia)
-- ---------------------------------------------------------------------
CREATE TABLE registro_tomas_medicamento (
    id_toma UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_medicamento UUID NOT NULL REFERENCES medicamentos(id_medicamento) ON DELETE CASCADE,
    fecha_programada DATE NOT NULL,
    hora_programada TIME NOT NULL,
    fecha_hora_real TIMESTAMP WITH TIME ZONE,
    estado_toma VARCHAR(20) NOT NULL, -- 'TAKEN', 'SKIPPED', 'PENDING'
    observacion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 8. TABLA: historia_clinica_antecedentes (Módulo 3)
-- ---------------------------------------------------------------------
CREATE TABLE historia_clinica_antecedentes (
    id_antecedente UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_paciente UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    tipo_antecedente VARCHAR(50) NOT NULL, -- 'ALERGIA', 'DIAGNOSTICO_CRONICO', 'QUIRURGICO', 'FAMILIAR'
    codigo_cie10 VARCHAR(20),
    descripcion TEXT NOT NULL,
    fecha_diagnostico_evento DATE,
    severidad VARCHAR(20), -- 'LEVE', 'MODERADA', 'SEVERA'
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 9. TABLA: archivos_adjuntos_cifrados (Bóveda Segura)
-- ---------------------------------------------------------------------
CREATE TABLE archivos_adjuntos_cifrados (
    id_archivo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_paciente UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'LABORATORIO', 'IMAGENOLOGIA', 'DIAGNOSTICO', 'RECETA'
    tipo_mime VARCHAR(50) NOT NULL,
    tamanio_bytes BIGINT NOT NULL,
    algoritmo_cifrado VARCHAR(30) DEFAULT 'AES-256-GCM',
    hash_sha256 VARCHAR(64) NOT NULL,
    ruta_almacenamiento_cifrado TEXT NOT NULL,
    institucion_emisora VARCHAR(150),
    fecha_documento DATE NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 10. TABLA: tutoriales_tramites (Módulo 5)
-- ---------------------------------------------------------------------
CREATE TABLE tutoriales_tramites (
    id_tutorial UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(200) NOT NULL,
    emoji VARCHAR(10) DEFAULT '📄',
    descripcion TEXT NOT NULL,
    entidad_reguladora VARCHAR(150) NOT NULL,
    url_oficial_verificada TEXT NOT NULL,
    verificado BOOLEAN DEFAULT TRUE,
    color_identificador VARCHAR(20) DEFAULT '#EBF3FD',
    orden INT DEFAULT 0,
    creado_por UUID REFERENCES usuarios(id_usuario),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 11. TABLA: pasos_tutorial
-- ---------------------------------------------------------------------
CREATE TABLE pasos_tutorial (
    id_paso UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_tutorial UUID NOT NULL REFERENCES tutoriales_tramites(id_tutorial) ON DELETE CASCADE,
    numero_paso INT NOT NULL,
    titulo_paso VARCHAR(200) NOT NULL,
    instrucciones TEXT NOT NULL,
    CONSTRAINT uq_tutorial_paso UNIQUE (id_tutorial, numero_paso)
);

-- ---------------------------------------------------------------------
-- 12. TABLA: logs_auditoria_seguridad (Ciberseguridad OMS)
-- ---------------------------------------------------------------------
CREATE TABLE logs_auditoria_seguridad (
    id_log UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    email_usuario VARCHAR(150),
    rol_usuario VARCHAR(30),
    accion VARCHAR(100) NOT NULL, -- 'LOGIN_2FA', 'ACCESS_HISTORY', 'DOWNLOAD_PDF', 'REVOKE_CONSENT'
    modulo VARCHAR(50) NOT NULL,
    detalles_evento TEXT,
    direccion_ip VARCHAR(45) NOT NULL,
    user_agent TEXT,
    estado_resultado VARCHAR(20) NOT NULL, -- 'SUCCESS', 'WARNING', 'DENIED'
    timestamp_evento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_timestamp ON logs_auditoria_seguridad(timestamp_evento DESC);
CREATE INDEX idx_logs_usuario ON logs_auditoria_seguridad(id_usuario);
