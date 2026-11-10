# Informe Técnico de Entrega - Módulo 1: Agenda Médica (Registro, Estados e Historial)

**Proyecto:** GuiaSalud Versión 1.0  
**Asignatura:** Ingeniería de Software II  
**Institución:** Fundación Escuela Tecnológica de Neiva (FET)  
**Semana del Sprint:** Semana 7  
**Fecha Límite:** Viernes, 09 de octubre de 2026  
**Responsables del Entregable:**  
- **Frontend & Tracker:** Francisco Trujillo Peralta  
- **Backend & Arquitectura:** David Marcet Ospina  

---

## 1. Alcance y Objetivos del Entregable

Conforme a lo acordado en la sesión de ingeniería del proyecto **GuiaSalud Versión 1.0**, se presenta la culminación e integración del **Módulo 1: Agenda Médica**, cubriendo integralmente el flujo de usuario, agendamiento de citas, control de estados clínicos, historial médico y la infraestructura de API REST con persistencia en PostgreSQL bajo directrices de auditoría y no eliminación física.

---

## 2. Componentes de Interfaz y Flujo de Usuario (Frontend)
*Responsable: Francisco Trujillo Peralta*

### 2.1 Maqueta de la Pantalla Principal
Ubicada en [AgendaScreen.tsx](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/src/screens/AgendaScreen.tsx), incluye:

1. **Encabezado y Acceso Rápido:**
   - Banner corporativo GuiaSalud con indicador de sincronización en tiempo real y botón de acción principal **"Agendar Nueva Cita"**.
2. **Vista Resumida de Próximas Citas (Hero Card):**
   - Tarjeta destacada superior con la cita médica más cercana cronológicamente.
   - Presentación de fecha completa en español (`es-CO`), hora, médico tratante e institución médica/IPS.
   - Panel de **indicaciones previas o preparación médica** (ayunos, documentos requeridos, órdenes).
   - Acciones inmediatas: **"✓ Marcar Realizada"**, **"✕ Cancelar"** y botón **"🔔 Activar Alerta"** (con simulación interactiva de recordatorios SMS y Notificación Push).
3. **Métricas Rápidas de Control:**
   - Cuatro contadores interactivos para navegación inmediata:
     - **Total** de citas registradas.
     - **Pendientes** (en ámbar).
     - **Realizadas** (en verde esmeralda).
     - **Historial / Canceladas** (en rojo suave).
4. **Calendario Interactivo:**
   - Tira interactiva con selector dinámico de días de la semana.
   - Indicadores numéricos de citas programadas por fecha.
   - Filtro directo al tocar un día específico y botón de restablecimiento rápido.
5. **Buscador y Filtros Avanzados:**
   - Búsqueda en vivo por nombre de especialista, médico, sede IPS o texto de preparación.
   - Selector de filtrado por especialidad médica.

### 2.2 Formulario Estructurado de Registro de Citas
Modal interactivo validado que captura de manera obligatoria y ordenada los 6 campos acordados:
1. **Especialidad médica:** Selector con 12 especialidades clínicas frecuentes (Medicina General, Cardiología, Laboratorio Clínico, Oftalmología, Pediatría, etc.).
2. **Fecha de la cita:** Formato estándar `YYYY-MM-DD`.
3. **Hora de la consulta:** Formato `HH:MM`.
4. **Profesional de la salud / Médico tratante:** Campo de texto con validación.
5. **Institución médica / IPS o Sede:** Campo de texto con sugerencias dinámicas (`datalist`) de entidades del Huila y Colombia.
6. **Observaciones previas o preparación médica:** Área de texto para registrar ayunos requeridos, exámenes diagnósticos previos o recomendaciones clínicas.

---

## 3. Lógica de Negocio y Estructura API REST (Backend)
*Responsable: David Marcet Ospina*

### 3.1 Endpoints Oficiales de la API REST
Definidos y montados bajo los prefijos `/api/citas` y `/api/v1/citas` (con compatibilidad en `/api/v1/agenda/appointments`):

| Método | Endpoint | Descripción | Roles Autorizados |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/citas` | Obtiene lista e historial de citas del usuario autenticado | `PATIENT`, `FAMILY`, `ADMIN` |
| `POST` | `/api/citas` | Crea y vincula nueva cita al ID del paciente autenticado | `PATIENT`, `FAMILY`, `ADMIN` |
| `PUT` | `/api/citas/:id` | Actualiza datos y/o estado de la cita médica | `PATIENT`, `FAMILY`, `ADMIN` |
| `PATCH` | `/api/citas/:id/status` | Actualización puntual de estado (`pendiente`, `realizada`, `cancelada`) | `PATIENT`, `FAMILY`, `ADMIN` |
| `DELETE` | `/api/citas/:id` | **Baja lógica (Soft-delete)** sin eliminación física | `PATIENT`, `FAMILY`, `ADMIN` |

### 3.2 Vinculación al Usuario Autenticado (RBAC y Seguridad)
- La autenticación extrae el `id` del token JWT verificado ([authMiddleware.ts](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/middlewares/authMiddleware.ts)).
- En caso de un rol familiar cuidador (`FAMILY`), se gestiona el `patientId` delegado legalmente.
- Todas las consultas SQL filtran estrictamente por `WHERE patient_id = $1`.

### 3.3 Regla Crítica: Garantía de No Eliminación Física en PostgreSQL
> **Directriz de Calidad y Auditoría:** *"Garantizando que los registros no se eliminen físicamente de PostgreSQL para mantener el historial clínico y los logs de auditoría."*

Para dar cumplimiento estricto a esta exigencia:
1. **Esquema Relacional en PostgreSQL:**
   - La tabla `citas_medicas` implementa las columnas `is_deleted BOOLEAN NOT NULL DEFAULT false` y `deleted_at TIMESTAMPTZ`.
   - Se agregó la restricción `CHECK (status IN ('pendiente', 'realizada', 'cancelada', 'pending', 'done', 'cancelled'))`.
2. **Comportamiento en Backend:**
   - Al ejecutar `DELETE /api/citas/:id`, el servicio [agendaService.ts](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/services/agendaService.ts) ejecuta un `UPDATE` cambiando el estado a `'cancelada'` y estableciendo `is_deleted = true`, manteniendo la fila intacta en el historial clínico.
3. **Auditoría de Seguridad Médica:**
   - El middleware [auditLogger.ts](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/middlewares/auditLogger.ts) y los manejadores de estado en [App.tsx](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/src/App.tsx) registran eventos auditados (`APPOINTMENT_CREATE`, `APPOINTMENT_STATUS_UPDATE`, `APPOINTMENT_SOFT_DELETE`) con marca temporal e IP.

---

## 4. Esquema DDL en PostgreSQL ([migrations.sql](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/config/migrations.sql))

```sql
CREATE TABLE IF NOT EXISTS citas_medicas (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  specialty         VARCHAR(120) NOT NULL,
  doctor            VARCHAR(150) NOT NULL,
  center            VARCHAR(200) NOT NULL,
  date              DATE NOT NULL,
  time              VARCHAR(10) NOT NULL,
  notes             TEXT DEFAULT '',
  status            VARCHAR(20) NOT NULL DEFAULT 'pendiente' 
                    CHECK (status IN ('pendiente', 'realizada', 'cancelada', 'pending', 'done', 'cancelled')),
  is_deleted        BOOLEAN NOT NULL DEFAULT false,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_patient_id ON citas_medicas(patient_id);
CREATE INDEX IF NOT EXISTS idx_citas_date ON citas_medicas(date);
CREATE INDEX IF NOT EXISTS idx_citas_status ON citas_medicas(status);
CREATE INDEX IF NOT EXISTS idx_citas_is_deleted ON citas_medicas(is_deleted);
```

---

## 5. Matriz de Pruebas y Validación Técnica

| Componente | Prueba Realizada | Resultado | Observaciones |
| :--- | :--- | :--- | :--- |
| **Backend TypeScript** | Compilación estricta `npm run build` (`tsc`) | **EXITOSO (Code 0)** | Tipos validados sin errores en `AppointmentStatus` y `AgendaController`. |
| **Frontend Vite/React** | Compilación de bundle `npm run build` | **EXITOSO (Code 0)** | 30 módulos transformados, 0 advertencias de sintaxis. |
| **API Endpoints** | Creación y actualización de estados | **EXITOSO** | Respuestas JSON estructuradas con formato `{ success: true, data: [...] }`. |
| **Persistencia Lógica** | Cancelación de cita sin borrado físico | **EXITOSO** | El registro permanece disponible para el historial clínico. |
| **UI/UX Interactivo** | Hero Card, Calendario semanal, Modal | **EXITOSO** | Diseño responsivo con Tailwind CSS v4, animaciones suaves y accesibilidad. |

---

## 6. Estado de Cumplimiento de la Entrega

- [x] **Pantallas interactivas de agendamiento:** Implementado en [AgendaScreen.tsx](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/src/screens/AgendaScreen.tsx).
- [x] **Lista de citas programadas y vista resumida:** Implementado con tarjeta destacada de próxima cita y chips de métricas.
- [x] **Calendario interactivo:** Implementado con selector semanal y conteo de consultas.
- [x] **Captura de los 6 campos del formulario:** Especialidad, médico, IPS, fecha, hora, observaciones previas.
- [x] **Endpoints REST para creación y actualización de estados:** Implementados en [citas.routes.ts](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/routes/citas.routes.ts) y [agendaController.ts](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/controllers/agendaController.ts).
- [x] **Garantía de no eliminación física en PostgreSQL:** Configurado en [migrations.sql](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/config/migrations.sql) y [agendaService.ts](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/services/agendaService.ts).
- [x] **Trazabilidad y logs de auditoría:** Integrado en [auditLogger.ts](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/backend/src/middlewares/auditLogger.ts) y [App.tsx](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/src/App.tsx).
- [x] **Fecha límite cumplida:** Viernes, 09 de octubre de 2026.
