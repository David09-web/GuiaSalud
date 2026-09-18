# 🩺 GuiaSalud Versión 1.0

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js_20-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?style=for-the-badge&logo=expo&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Plataforma Integral de Salud Digital, Adherencia Farmacológica, Agenda Médica e Historia Clínica Cifrada**

*Ingeniería de Software II — Fundación Escuela Tecnológica de Neiva (FET)*

</div>

---

## 👥 Equipo de Desarrollo y Responsables

| Integrante | Rol Principal | Enfoque Técnico |
| :--- | :--- | :--- |
| **David Marcet Ospina** | **Backend Lead & DB Architect** | API REST Node.js/Express, TypeScript, Base de Datos PostgreSQL, Cifrado AES-256-GCM y GitFlow |
| **Juan Camilo Ramírez** | **Frontend & Mobile Lead** | Web React 19 + Tailwind CSS v4, App Móvil React Native / Expo, Experiencia de Usuario (UI/UX) |
| **Francisco Trujillo Peralta** | **QA & Security Tracking** | Matriz de Riesgos OMS, Auditoría de Seguridad, Trazabilidad de Logs y Plan de Pruebas |

- **Docente Gestor:** Miguel Antonio Urbano Silva  
- **Fecha Límite Entregable 1:** Viernes, 18 de septiembre de 2026  

---

## 🏛️ Arquitectura General del Sistema

```
+-----------------------------------------------------------------------------------+
|                              CAPA DE PRESENTACIÓN                                 |
|  +---------------------------------------+  +----------------------------------+  |
|  |           Web SPA / PWA               |  |           Mobile App             |  |
|  |  React 19 + TypeScript + Tailwind v4  |  |  React Native + Expo (Android)   |  |
|  +---------------------------------------+  +----------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | (HTTPS / REST API + JWT 2FA)
+------------------------------------------v----------------------------------------+
|                               CAPA DE SERVICIOS                                   |
|                        Node.js / Express / TypeScript                             |
|  - Módulo 1: Agenda Médica & Estados (Pending, Done, Cancelled)                   |
|  - Módulo 2: Medicamentos, Tomas Diarias & Cálculo de Adherencia                  |
|  - Módulo 3: Historia Clínica Cifrada en Reposo (AES-256-GCM)                     |
|  - Módulo 4: Perfil, Familiar Cuidador & Habeas Data                              |
|  - Módulo 5: Catálogo de Trámites SGSSS & Enlaces Oficiales ADRES/EPS             |
|  - Seguridad: Middlewares RBAC (PATIENT, FAMILY, ADMIN) + Auditoría OMS           |
+------------------------------------------+----------------------------------------+
                                           | (PostgreSQL Client / SSL Pool)
+------------------------------------------v----------------------------------------+
|                             CAPA DE PERSISTENCIA                                  |
|                                PostgreSQL 15+                                     |
|  [ Tablas Relacionales ]  [ Restricciones & Triggers ]  [ Auditoría de Accesos ]  |
+-----------------------------------------------------------------------------------+
```

---

## 🌿 Estrategia de Ramas Git (GitFlow)

El repositorio sigue la convención de ramas **GitFlow**:

- **`main`**: Rama principal de producción con versiones estables etiquetadas (`v1.0.0`, etc.).
- **`develop`**: Rama de integración y desarrollo continuo donde convergen las características.
- **`feature/<nombre>`**: Ramas para el desarrollo de módulos específicos:
  - `feature/backend-api-auth`: API REST, autenticación 2FA y JWT.
  - `feature/frontend-web-ui`: Interfaz Web React 19 y Tailwind CSS v4.
  - `feature/mobile-app-setup`: Proyecto móvil React Native / Expo.
- **`hotfix/<nombre>`**: Corrección de fallos críticos en producción.

---

## 📁 Estructura del Repositorio

```
GuiaSalud/
├── backend/                   # 🖥️ API REST Node.js / Express / TypeScript
│   ├── src/
│   │   ├── config/            # Base de datos (pg Pool) y variables (.env)
│   │   ├── controllers/       # Controladores (Auth, Agenda, Meds, History, Admin)
│   │   ├── middlewares/       # Auth JWT, RBAC, Errores y Auditoría OMS
│   │   ├── routes/            # Endpoints /api/v1
│   │   ├── services/          # Lógica de negocio y cifrado AES-256-GCM
│   │   ├── types/             # Tipado TypeScript
│   │   ├── app.ts             # Configuración de Express
│   │   └── server.ts          # Servidor HTTP
│   ├── .env.example           # Plantilla de variables de entorno
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── mobile/                    # 📱 Aplicación Móvil React Native / Expo
│   ├── src/
│   │   ├── navigation/        # Stack & Bottom Tabs
│   │   ├── screens/           # Pantallas (Inicio, Agenda, Medicinas, Historia, Perfil)
│   │   ├── services/          # Cliente API REST
│   │   ├── theme/             # Tokens de diseño y colores
│   │   └── types/             # Tipado TypeScript
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   └── README.md
│
├── src/                       # 🌐 Aplicación Web React 19 + Tailwind CSS v4
│   ├── components/            # Header, BottomNav, FileViewerModal
│   ├── screens/               # Pantallas (Admin, Agenda, Historia, Login, etc.)
│   ├── data.ts                # Mock data y persistencia
│   ├── index.css              # Tailwind CSS v4
│   ├── App.tsx                # Orquestador UI
│   └── main.tsx
│
├── docs/                      # 📚 Documentación Técnica y Académica
│   ├── API_REST_SPECIFICATION.md          # Especificación OpenAPI / REST
│   ├── CONFIGURACION_REPOSITORIO_Y_ENTORNOS.md # Informe técnico del entregable 1
│   ├── DATABASE_MODEL_POSTGRESQL.sql     # Script DDL de Base de Datos
│   ├── DIAGRAMA_ER.md                    # Diagrama Entidad-Relación
│   ├── MANUAL_DE_USUARIO_Y_ARQUITECTURA.md# Manual de usuario y arquitectura
│   └── PLAN_PRUEBAS_Y_MATRIZ_RIESGOS_OMS.md # Matriz de riesgos y plan de pruebas
│
├── index.html                 # Shell HTML Vite
├── package.json               # Dependencias Web Frontend
├── tsconfig.json              # Configuración TypeScript Web
├── vite.config.ts             # Configuración Vite
└── README.md                  # Este documento
```

---

## 🚀 Guía de Inicio Rápido (Quick Start)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/David09-web/GuiaSalud.git
cd GuiaSalud
```

### 2. Ejecutar la Aplicación Web
```bash
npm install
npm run dev
```
👉 Accede a `http://localhost:8443` en tu navegador.

### 3. Ejecutar el Servidor Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
👉 API disponible en `http://localhost:5000/api/v1` (Healthcheck: `http://localhost:5000/api/v1/health`).

### 4. Ejecutar la Aplicación Móvil
```bash
cd mobile
npm install
npx expo start
```
👉 Escanea el código QR con la app **Expo Go** o pulsa `a` para emulador Android.

### 5. Cargar Base de Datos PostgreSQL
```bash
psql -U postgres -d guiasalud_db -f docs/DATABASE_MODEL_POSTGRESQL.sql
```

---

## 🛡️ Estándares de Seguridad y Normativa

- **Cifrado en Tránsito:** HTTPS / TLS 1.3 con JWT y doble factor (2FA).
- **Cifrado en Reposo:** Cifrado simétrico AES-256-GCM para documentos e historias clínicas.
- **Control de Acceso:** RBAC estricto que restringe el acceso de administradores a la historia médica privada.
- **Habeas Data (Ley 1581 de 2012):** Funciones de revocación de consentimiento y exportación de datos.
- **Seguridad en Salud Digital (OMS):** Registro de auditoría para trazabilidad de accesos médicos.
