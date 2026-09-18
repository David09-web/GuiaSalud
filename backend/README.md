# Backend API REST - GuiaSalud Versión 1.0

Este módulo contiene la API REST oficial de **GuiaSalud v1.0**, desarrollada con **Node.js**, **Express**, **TypeScript** y **PostgreSQL**, con autenticación de dos factores (2FA), control de acceso basado en roles (RBAC) y cifrado en reposo AES-256-GCM para datos clínicos.

---

## 👤 Responsable Técnico
- **David Marcet Ospina** (*Backend Lead & Database Architect*)
- **Asignatura:** Ingeniería de Software II - FET Neiva
- **Docente Gestor:** Miguel Antonio Urbano Silva

---

## 🛠️ Tecnologías y Librerías

- **Entorno de Ejecución:** Node.js (v18+ LTS / v20+)
- **Lenguaje:** TypeScript 5.7+
- **Framework Web:** Express 4.21+
- **Base de Datos:** PostgreSQL 15+ (con Pool `pg`)
- **Seguridad:** 
  - `jsonwebtoken` (JWT con flujo 2FA)
  - `helmet` (Seguridad en cabeceras HTTP)
  - `cors` (Control de origen cruzado)
  - `crypto` nativo (Cifrado simétrico AES-256-GCM)
  - `bcryptjs` (Hashing seguro de credenciales)
- **Validación:** `zod`
- **Logs:** `morgan` + Módulo de Auditoría OMS

---

## 📂 Estructura de Directorios

```
backend/
├── src/
│   ├── config/             # Configuración de base de datos y variables de entorno
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/        # Controladores de peticiones HTTP
│   │   ├── adminController.ts
│   │   ├── agendaController.ts
│   │   ├── authController.ts
│   │   ├── historyController.ts
│   │   └── medicationController.ts
│   ├── middlewares/        # Middlewares (Auth JWT, RBAC, Errores, Auditoría)
│   │   ├── auditLogger.ts
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   └── rolesMiddleware.ts
│   ├── routes/             # Definición de rutas REST /api/v1
│   │   ├── admin.routes.ts
│   │   ├── agenda.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── history.routes.ts
│   │   ├── medication.routes.ts
│   │   └── index.ts
│   ├── services/           # Lógica de negocio y criptografía
│   │   ├── agendaService.ts
│   │   ├── authService.ts
│   │   ├── cryptoService.ts
│   │   ├── historyService.ts
│   │   └── medicationService.ts
│   ├── types/              # Tipos e interfaces TypeScript
│   │   └── index.ts
│   ├── app.ts              # Configuración de Express
│   └── server.ts           # Inicialización y arranque del servidor
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración del compilador TypeScript
└── README.md
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Requisitos Previos
- Node.js (versión 18 o superior)
- PostgreSQL 15+ (opcional para pruebas en memoria)

### 2. Instalación de Dependencias
```bash
cd backend
npm install
```

### 3. Configuración de Variables de Entorno
Crea un archivo `.env` a partir de `.env.example`:
```bash
cp .env.example .env
```

Configura tus credenciales en `.env` (ej. conexión a PostgreSQL, clave secreta JWT y clave de cifrado AES-256).

### 4. Ejecución en Modo Desarrollo
```bash
npm run dev
```

El servidor iniciará en `http://localhost:5000/api/v1`.

### 5. Compilación y Ejecución en Producción
```bash
npm run build
npm start
```

---

## 📡 Endpoints Principales

Para ver la especificación completa, consultar [`docs/API_REST_SPECIFICATION.md`](../docs/API_REST_SPECIFICATION.md).

| Método | Endpoint | Descripción | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Estado del servicio y tiempo de actividad | Público |
| `POST` | `/api/v1/auth/login` | Inicio de sesión (Emite código 2FA) | Público |
| `POST` | `/api/v1/auth/verify-2fa` | Validación 2FA y emisión de JWT | Público |
| `GET` | `/api/v1/agenda/appointments` | Listar citas médicas del paciente | `PATIENT`, `FAMILY` |
| `POST` | `/api/v1/agenda/appointments` | Agendar nueva cita médica | `PATIENT`, `FAMILY` |
| `GET` | `/api/v1/medications` | Listar medicamentos y adherencia | `PATIENT`, `FAMILY` |
| `POST` | `/api/v1/medications/:id/doses` | Registrar toma u omisión de dosis | `PATIENT`, `FAMILY` |
| `GET` | `/api/v1/clinical-history` | Historia clínica cifrada AES-256 | `PATIENT`, `FAMILY` (Admin Bloqueado) |
| `GET` | `/api/v1/clinical-history/export-pdf` | Generar Resumen Clínico Consolidado | `PATIENT`, `FAMILY` |
| `GET` | `/api/v1/admin/tutorials` | Catálogo de trámites SGSSS | Público / Todos |
| `POST` | `/api/v1/admin/tutorials` | Crear o editar tutorial de trámite | `ADMIN` |
| `GET` | `/api/v1/admin/audit-logs` | Logs de auditoría según OMS | `ADMIN` |
