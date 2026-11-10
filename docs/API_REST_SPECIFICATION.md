# Especificación Técnica de API REST - GuiaSalud Versión 1.0

**Proyecto:** GuiaSalud Versión 1.0  
**Asignatura:** Ingeniería de Software II  
**Institución:** Fundación Escuela Tecnológica de Neiva (FET)  
**Docente Gestor:** Miguel Antonio Urbano Silva  
**Líderes de Desarrollo:** David Marcet Ospina (Backend), Juan Camilo Ramírez (Frontend), Francisco Trujillo Peralta (QA & Tracking)

---

## 1. Arquitectura y Estándares de la API

- **Protocolo:** HTTPS (TLS 1.3)
- **Formato de Intercambio:** JSON (`application/json`)
- **Autenticación:** JSON Web Tokens (JWT) en cabecera `Authorization: Bearer <TOKEN>` con Doble Factor (2FA TOTP / SMS).
- **Control de Acceso:** Rol-Based Access Control (RBAC) con roles `PATIENT`, `FAMILY`, `ADMIN`.
- **Cifrado en Reposo:** AES-256-GCM para archivos de historia clínica y datos médicos sensibles.

---

## 2. Endpoints del Módulo de Autenticación y Seguridad

### `POST /api/v1/auth/login`
- **Descripción:** Inicio de sesión con credenciales básicas.
- **Request Body:**
  ```json
  {
    "email": "maria.rodriguez@gmail.com",
    "password": "PasswordSeguro123*"
  }
  ```
- **Response (200 OK):** Requiere verificación 2FA.
  ```json
  {
    "require2FA": true,
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "message": "Ingrese el código de 6 dígitos enviado a su teléfono o app autenticadora."
  }
  ```

### `POST /api/v1/auth/verify-2fa`
- **Descripción:** Valida el token de doble factor y emite el JWT final.
- **Request Body:**
  ```json
  {
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "twoFactorCode": "849201"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-001",
      "name": "María Rodríguez",
      "email": "maria.rodriguez@gmail.com",
      "role": "PATIENT"
    }
  }
  ```

---

## 3. Endpoints del Módulo 1: Agenda Médica (Registro, Estados e Historial)
**Responsables:** Francisco Trujillo Peralta (Frontend) y David Marcet Ospina (Backend)  
**Convención:** Disponibles bajo `/api/citas`, `/api/v1/citas` y `/api/v1/agenda/appointments`.

### `GET /api/citas` (o `/api/v1/citas`)
- **Descripción:** Obtiene la lista e historial de citas médicas del usuario autenticado (o paciente a cargo si es familiar cuidador).
- **Roles permitidos:** `PATIENT`, `FAMILY` (con delegación activa), `ADMIN`.
- **Query Params:** `?status=pendiente|realizada|cancelada|all`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44",
        "patientId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "date": "2026-10-15",
        "time": "09:30",
        "specialty": "Medicina General",
        "doctor": "Dr. Andrés Morales",
        "center": "Centro Médico El Bosque - Consultorio 304",
        "status": "pendiente",
        "notes": "Control semestral de presión arterial.",
        "isDeleted": false,
        "createdAt": "2026-09-01T10:00:00Z"
      }
    ]
  }
  ```

### `POST /api/citas` (o `/api/v1/citas`)
- **Descripción:** Registra una nueva cita médica vinculada al ID del paciente autenticado.
- **Campos obligatorios:** Especialidad, Médico, Centro/IPS, Fecha, Hora.
- **Request Body:**
  ```json
  {
    "specialty": "Cardiología",
    "doctor": "Dra. Claudia Vega",
    "center": "Clínica del Norte - Piso 4",
    "date": "2026-10-22",
    "time": "14:00",
    "notes": "Revisión de electrocardiograma y ajuste de dosis."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Cita médica agendada exitosamente en el sistema GuiaSalud.",
    "data": {
      "id": "apt-892144",
      "patientId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "date": "2026-10-22",
      "time": "14:00",
      "specialty": "Cardiología",
      "doctor": "Dra. Claudia Vega",
      "center": "Clínica del Norte - Piso 4",
      "status": "pendiente",
      "notes": "Revisión de electrocardiograma y ajuste de dosis.",
      "isDeleted": false
    }
  }
  ```

### `PUT /api/citas/:id`
- **Descripción:** Actualiza los datos o el estado de una cita médica existente.
- **Request Body:**
  ```json
  {
    "time": "15:00",
    "notes": "Se pospuso 1 hora por disponibilidad del especialista.",
    "status": "pendiente"
  }
  ```
- **Response (200 OK):** Cita actualizada con registro automático de auditoría.

### `PATCH /api/citas/:id/status`
- **Descripción:** Cambio ágil de estado de la cita (`pendiente`, `realizada`, `cancelada`).
- **Request Body:**
  ```json
  {
    "status": "realizada"
  }
  ```
- **Response (200 OK):** Estado actualizado con trazabilidad en historial.

### `DELETE /api/citas/:id` (Baja Lógica / Soft-Delete)
- **Regla Crítica:** **Sin eliminación física en PostgreSQL**. Se marca `is_deleted = true`, `status = 'cancelada'`, preservando la cita para auditoría médica e historial clínico.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Cita médica dada de baja lógicamente (conservada en historial clínico y auditoría conforme a ley médica)."
  }
  ```


---

## 4. Endpoints del Módulo 2: Control de Medicamentos

### `GET /api/v1/medications`
- **Roles permitidos:** `PATIENT`, `FAMILY` (con permiso `viewMeds`).
- **Response (200 OK):**
  ```json
  [
    {
      "id": "med-001",
      "name": "Enalapril",
      "dose": "10 mg",
      "frequency": "Cada 12 horas",
      "durationDays": 90,
      "daysElapsed": 76,
      "takenToday": "taken",
      "prescribedBy": "Dr. Andrés Morales"
    }
  ]
  ```

### `POST /api/v1/medications/:id/doses`
- **Descripción:** Registrar toma realizada u omitida en el historial.
- **Request Body:**
  ```json
  {
    "status": "taken",
    "takenAt": "2026-09-02T08:05:00Z"
  }
  ```

---

## 5. Endpoints del Módulo 3: Historia Clínica y Exportación PDF

### `GET /api/v1/clinical-history`
- **Roles permitidos:** `PATIENT`, `FAMILY` (con permiso `viewHistory`).
- **Restricción estricta:** `ADMIN` recibe `403 Forbidden` (protección de confidencialidad médica).
- **Response (200 OK):**
  ```json
  {
    "bloodType": "O+",
    "allergies": ["Penicilina", "Aspirina", "Látex"],
    "conditions": ["Hipertensión arterial (I10)", "Diabetes tipo 2 (E11.9)"],
    "surgeries": ["Apendicectomía (2018)"],
    "filesCount": 4
  }
  ```

### `GET /api/v1/clinical-history/export-pdf`
- **Descripción:** Genera y descarga el Resumen Clínico Consolidado oficial en PDF.

---

## 6. Endpoints del Módulo 4: Perfil, Cuidador Familiar & Habeas Data

### `POST /api/v1/caregivers/delegate`
- **Descripción:** Paciente delega acceso a un familiar con permisos específicos.
- **Request Body:**
  ```json
  {
    "email": "carlos.rodriguez@gmail.com",
    "relation": "Hermano",
    "permissions": {
      "viewAgenda": true,
      "viewMeds": true,
      "viewHistory": false,
      "receiveAlerts": true
    }
  }
  ```

### `POST /api/v1/habeas-data/revoke`
- **Descripción:** Revoca el consentimiento informado de tratamiento de datos personales.

---

## 7. Endpoints del Módulo 5: Tutoriales y Panel Administrador

### `GET /api/v1/tutorials`
- **Público:** Acceso abierto a todos los roles para consulta de trámites.

### `POST /api/v1/admin/tutorials`
- **Roles permitidos:** `ADMIN`.
- **Request Body:**
  ```json
  {
    "title": "Descargar Certificado EPS",
    "entityName": "ADRES",
    "officialUrl": "https://www.adres.gov.co",
    "steps": [ ... ]
  }
  ```

### `GET /api/v1/admin/audit-logs`
- **Roles permitidos:** `ADMIN`.
- **Descripción:** Monitoreo en tiempo real de logs de seguridad conforme a pautas de la OMS.

---

## 8. Endpoints del Motor de Notificaciones y Recordatorios (Acta N° 06)
**Responsables:** David Marcet Ospina (Backend) y Juan Camilo Ramírez (Backend/Mobile)  
**Supervisión QA:** Francisco Trujillo Peralta

### `GET /api/v1/notifications/preferences`
- **Descripción:** Obtiene las preferencias de canales de notificación (Web, Push, Email) y tiempos de aviso del paciente autenticado.
- **Roles permitidos:** `PATIENT`, `FAMILY` (con delegación activa).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "channels": {
        "web": true,
        "push": true,
        "email": true
      },
      "appointments": {
        "notify24h": true,
        "notify2h": true
      },
      "medications": {
        "enabled": true,
        "allowSnooze": true,
        "snoozeMinutes": 15
      },
      "quietHours": {
        "enabled": false,
        "start": "22:00",
        "end": "06:00"
      }
    }
  }
  ```

### `PUT /api/v1/notifications/preferences`
- **Descripción:** Actualiza o silencia las preferencias de notificación del paciente.
- **Request Body:**
  ```json
  {
    "channels": {
      "web": true,
      "push": true,
      "email": false
    },
    "appointments": {
      "notify24h": true,
      "notify2h": true
    },
    "medications": {
      "enabled": true,
      "allowSnooze": true
    }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Preferencias de notificación actualizadas exitosamente."
  }
  ```

### `GET /api/v1/notifications`
- **Descripción:** Lista el buzón interactivo de alertas internas del usuario (citas próximas y tomas pendientes).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "unreadCount": 1,
    "data": [
      {
        "id": "notif-001",
        "type": "APPOINTMENT_REMINDER",
        "channel": "web",
        "title": "Cita médica en 24 horas",
        "message": "Recuerde su cita de Medicina General mañana a las 09:30 a.m. en Centro Médico El Bosque.",
        "targetId": "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44",
        "read": false,
        "createdAt": "2026-10-21T07:00:00Z"
      }
    ]
  }
  ```

---

## 7. Endpoints del Módulo 3: Historia Clínica Personal y Bóveda Cifrada

**Regla de Seguridad y RBAC:**  
El acceso a la historia clínica y a sus adjuntos está estrictamente restringido al paciente titular (`PATIENT`), a su familiar delegado con autorización (`FAMILY`) y a su médico tratante. El rol `ADMIN` tiene acceso estrictamente bloqueado con código HTTP `403 Forbidden` conforme a la Ley 1581 de 2012 (Habeas Data) y el secreto profesional médico.

### `GET /api/historia-clinica` (o `/api/v1/historia-clinica`)
- **Descripción:** Obtiene el expediente médico completo del paciente con antecedentes, alergias, diagnósticos CIE-10, cronología de procedimientos y payload cifrado en reposo (AES-256-GCM).
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response (200 OK):**
  ```json
  {
    "patientId": "usr-001",
    "bloodType": "O+",
    "allergies": [
      {
        "id": "alg-001",
        "allergen": "Penicilina",
        "reaction": "Anafilaxia leve, urticaria y prurito",
        "severity": "Severa / Anafilaxia",
        "diagnosedYear": "2012",
        "status": "Activa"
      }
    ],
    "backgrounds": [
      {
        "id": "bg-001",
        "category": "Patológico",
        "title": "Hipertensión arterial esencial",
        "description": "Estadío I controlada con Enalapril 10mg cada 12h",
        "year": "2018"
      }
    ],
    "diagnoses": [
      {
        "id": "diag-001",
        "code": "I10",
        "title": "Hipertensión arterial esencial (primaria)",
        "category": "Cardiovascular",
        "diagnosedDate": "2018-05-14",
        "status": "Controlado",
        "doctor": "Dr. Andrés Morales"
      }
    ],
    "procedures": [
      {
        "id": "proc-001",
        "title": "Electrocardiograma de Reposo 12 Derivaciones",
        "type": "Examen Diagnóstico",
        "date": "2026-06-30",
        "institution": "Clínica del Norte - Cardiología",
        "outcome": "Ritmo sinusal normal"
      }
    ],
    "filesCount": 4,
    "encryptedPayload": "ivHex:authTagHex:encryptedHexPayload",
    "sha256Signature": "7a8f9c...",
    "lastUpdated": "2026-10-22T10:00:00.000Z"
  }
  ```

### `POST /api/historia-clinica`
- **Descripción:** Registra o actualiza antecedentes médicos, nuevas alergias o diagnósticos CIE-10.
- **Request Body:**
  ```json
  {
    "newAllergy": {
      "allergen": "Sulfas",
      "reaction": "Eritema multiforme",
      "severity": "Moderada",
      "diagnosedYear": "2025"
    },
    "newDiagnosis": {
      "code": "E11.9",
      "title": "Diabetes mellitus tipo 2 sin mención de complicación",
      "category": "Endocrinología",
      "status": "En tratamiento",
      "doctor": "Dra. Claudia Vega"
    }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Historia clínica actualizada con cifrado en reposo exitosamente.",
    "history": { ... }
  }
  ```

### `GET /api/historia-clinica/adjuntos`
- **Descripción:** Consulta la lista de archivos médicos y fórmulas adjuntas con filtrado dinámico por categoría, texto y rango de fechas.
- **Query Parameters:**
  - `dateFrom` (opcional): Fecha inicial en formato `YYYY-MM-DD`
  - `dateTo` (opcional): Fecha final en formato `YYYY-MM-DD`
  - `category` (opcional): `Laboratorio`, `Imagenología`, `Diagnóstico`, `Receta`
  - `query` (opcional): Texto de búsqueda libre (nombre, institución o hallazgos)
- **Response (200 OK):**
  ```json
  {
    "count": 4,
    "encryptionStandard": "AES-256-GCM / SHA-256 Integrity Verification",
    "attachments": [
      {
        "id": "doc-001",
        "patientId": "usr-001",
        "name": "Resultado Hemograma Completo y Glucemia",
        "type": "PDF",
        "category": "Laboratorio",
        "date": "2026-08-28",
        "size": "1.2 MB",
        "encrypted": true,
        "institution": "Laboratorios El Bosque",
        "sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        "cipherAlgorithm": "AES-256-GCM"
      }
    ]
  }
  ```

### `POST /api/historia-clinica/adjuntos`
- **Descripción:** Carga un nuevo archivo clínico (PDF, radiografía, ecografía, orden médica), aplicando cifrado en reposo AES-256-GCM y generando el hash criptográfico SHA-256.
- **Request Body:**
  ```json
  {
    "name": "Radiografía de Tórax AP y Lateral",
    "category": "Imagenología",
    "type": "Imagen",
    "institution": "Clínica del Norte - Imágenes Diagnósticas",
    "notes": "Campos pulmonares claros, silueta cardiovascular normal."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Archivo clínico cifrado y archivado exitosamente (AES-256-GCM).",
    "attachment": {
      "id": "doc-1729600000000",
      "name": "Radiografía de Tórax AP y Lateral",
      "date": "2026-10-22",
      "encrypted": true,
      "sha256": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      "cipherAlgorithm": "AES-256-GCM"
    }
  }
  ```

### `DELETE /api/historia-clinica/adjuntos/:id`
- **Descripción:** Elimina de forma segura un archivo adjunto del expediente.
- **Response (200 OK):**
  ```json
  {
    "message": "Archivo clínico eliminado exitosamente."
  }
  ```

### `GET /api/historia-clinica/export-pdf`
- **Descripción:** Genera el documento consolidado de la historia clínica digital con firma criptográfica y enlace de descarga.
- **Response (200 OK):**
  ```json
  {
    "downloadUrl": "/downloads/resumen-clinico-usr-001-1729600000000.pdf",
    "generatedAt": "2026-10-22T10:30:00.000Z",
    "documentChecksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```
