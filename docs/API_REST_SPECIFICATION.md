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

## 3. Endpoints del Módulo 1: Agenda Médica

### `GET /api/v1/agenda/appointments`
- **Roles permitidos:** `PATIENT`, `FAMILY` (si tiene permiso `viewAgenda`).
- **Query Params:** `?status=pending|done|cancelled&date=2026-09-04`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "apt-001",
      "date": "2026-09-04",
      "time": "09:30",
      "specialty": "Medicina General",
      "doctor": "Dr. Andrés Morales",
      "center": "Centro Médico El Bosque",
      "status": "pending",
      "notes": "Control semestral de presión arterial."
    }
  ]
  ```

### `POST /api/v1/agenda/appointments`
- **Descripción:** Crear una nueva cita médica programada.
- **Request Body:**
  ```json
  {
    "date": "2026-09-10",
    "time": "14:00",
    "specialty": "Cardiología",
    "doctor": "Dra. Claudia Vega",
    "center": "Clínica del Norte",
    "notes": "Revisión de electrocardiograma."
  }
  ```

### `PATCH /api/v1/agenda/appointments/:id/status`
- **Descripción:** Actualizar el estado de la cita (`pending`, `done`, `cancelled`).
- **Request Body:**
  ```json
  {
    "status": "done"
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
