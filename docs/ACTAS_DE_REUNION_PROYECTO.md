# 📋 Libro Oficial de Actas de Reunión y Acuerdos Técnicos
## Proyecto: GuiaSalud Versión 1.0

**Institución:** Fundación Escuela Tecnológica de Neiva (FET)  
**Programa Académico:** Ingeniería de Software  
**Asignatura:** Ingeniería de Software II  
**Docente Gestor / Asesor:** Miguel Antonio Urbano Silva  
**Período Académico:** 2026-II  
**Equipo de Desarrollo:**  
- **David Marcet Ospina** — Backend Lead & DB Architect  
- **Juan Camilo Ramírez** — Frontend & Mobile Lead  
- **Francisco Trujillo Peralta** — QA & Security Tracking  

---

## 📑 Control del Registro de Actas

| N° Acta | Fecha de Sesión | Semana | Objetivo Principal | Estado |
| :---: | :---: | :---: | :--- | :---: |
| **01** | 21/08/2026 | Semana 1 | Constitución del equipo, definición de roles, alcance de GuiaSalud y aprobación del stack tecnológico. | **Aprobada** |
| **02** | 04/09/2026 | Semana 3 | Levantamiento de requisitos de software, diseño ER en PostgreSQL y convención GitFlow. | **Aprobada** |
| **03** | 18/09/2026 | Semana 5 | Revisión Entregable 1, endpoints REST, cifrado AES-256-GCM y autenticación 2FA. | **Aprobada** |
| **04** | 02/10/2026 | Semana 6 | Culminación Módulo 5 (Tutoriales SGSSS y Panel Admin), RBAC y Matriz de Riesgos OMS. | **Aprobada** |
| **05** | 09/10/2026 | Semana 7 | Retroalimentación Docente: Reagendamiento con fecha interactiva, filtros de agenda, edición de medicamentos, plan de trabajo y convocatorias. | **Aprobada** |
| **06** | 21/10/2026 | Semana 9 | Implementación del motor automatizado de alertas y recordatorios multicanal (Push/Email/Web) y background workers. | **Aprobada** |
| **07** | 22/10/2026 | Semana 10 | Coordinación e implementación del Módulo 3: Historia Clínica Personal, estructuración de expediente médico, bóveda cifrada en reposo (AES-256) y endpoints REST. | **Aprobada** |

---

# 📝 ACTA N° 01: Constitución de Equipo, Delimitación de Alcance y Stack Tecnológico

- **Fecha:** Viernes, 21 de agosto de 2026  
- **Hora:** 08:00 a. m. – 10:30 a. m.  
- **Lugar:** Laboratorio de Cómputo 3 — Sede Principal FET Neiva  
- **Tipo de Sesión:** Ordinaria de Inicio de Proyecto  
- **Convocante:** Equipo GuiaSalud en común acuerdo  
- **Asistentes:**  
  1. David Marcet Ospina (Estudiante / Desarrollador)  
  2. Juan Camilo Ramírez (Estudiante / Desarrollador)  
  3. Francisco Trujillo Peralta (Estudiante / Desarrollador)  

### 1. Orden del Día
1. Verificación del quórum.  
2. Delimitación de la problemática en el Sistema General de Seguridad Social en Salud (SGSSS) en el Huila y Colombia.  
3. Definición de la visión y alcance de la solución: **GuiaSalud Versión 1.0**.  
4. Asignación formal de roles y responsabilidades.  
5. Selección y aprobación del stack tecnológico y herramientas de control de versiones.  
6. Compromisos y fecha de próxima sesión.  

### 2. Desarrollo de la Sesión
- **Diagnóstico:** Se analizó la alta tasa de inasistencia a consultas médicas programadas en adultos mayores y pacientes con patologías crónicas, el abandono de tratamientos por falta de recordatorios claros y la dispersión en los trámites de salud.  
- **Propuesta de Solución:** Crear **GuiaSalud**, una plataforma web/móvil multiplataforma que centralice la agenda médica, el control posológico de medicamentos, la historia clínica digital cifrada y un catálogo verificado de trámites ante EPS/IPS/ADRES.  
- **Distribución de Roles:**  
  - **David Marcet Ospina:** Liderazgo de Backend, Arquitectura de Base de Datos relacional PostgreSQL, Servicios de Cifrado y API REST.  
  - **Juan Camilo Ramírez:** Liderazgo de Frontend Web (React 19 + Tailwind CSS v4) y Aplicación Móvil (React Native con Expo), garantizando interfaces accesibles y limpias.  
  - **Francisco Trujillo Peralta:** Calidad de Software (QA), Tracker de avance técnico, Trazabilidad de Auditoría conforme a directrices de la OMS y Matriz de Pruebas.  
- **Stack Tecnológico Aprobado:**  
  - Frontend Web: React 19, TypeScript, Tailwind CSS v4, Vite 8.  
  - Móvil: React Native con Expo (Android/iOS).  
  - Backend: Node.js 20, Express, TypeScript.  
  - Base de Datos: PostgreSQL 15+ con pool de conexiones y directrices de auditoría estricta.  
  - Control de Versiones: Git con flujo **GitFlow** (`main`, `develop`, ramas `feature/*`).  

### 3. Acuerdos y Compromisos
| Responsable | Tarea Asignada | Fecha Límite |
| :--- | :--- | :---: |
| David Marcet | Inicializar repositorio en GitHub, ramas GitFlow y estructura base de Node.js/Express. | 28/08/2026 |
| Juan Camilo Ramírez | Configurar scaffold web en React 19 + Tailwind v4 y proyecto Expo en rama develop. | 28/08/2026 |
| Francisco Trujillo | Redactar acta 01 y diseñar plantilla de matriz de seguimiento técnico y riesgos. | 28/08/2026 |

---

# 📝 ACTA N° 02: Requisitos de Software, Modelo Relacional y Directriz de No Borrado

- **Fecha:** Viernes, 04 de septiembre de 2026  
- **Hora:** 08:30 a. m. – 11:00 a. m.  
- **Lugar:** Sala de Trabajo Colaborativo — FET Neiva  
- **Tipo de Sesión:** Ordinaria de Diseño de Arquitectura  
- **Asistentes:** David Marcet Ospina, Juan Camilo Ramírez, Francisco Trujillo Peralta.  

### 1. Orden del Día
1. Verificación del repositorio y ramas activas.  
2. Levantamiento y formalización de requisitos funcionales (RF) y no funcionales (RNF).  
3. Presentación y validación del diagrama Entidad-Relación en PostgreSQL.  
4. Análisis de normatividad colombiana (Ley 1581 de 2012 y Habeas Data en Salud).  
5. Compromisos.  

### 2. Desarrollo de la Sesión
- **Requisitos de Software Priorizados:**  
  - Módulo 1 (Agenda): Agendamiento con fecha, hora, médico, IPS, especialidad y notas previas; control de 3 estados formales (`pendiente`, `realizada`, `cancelada`).  
  - Módulo 2 (Medicamentos): Registro de fármacos, cálculo diario de progreso posológico y registro de tomas/omisiones.  
  - Módulo 3 (Historia Clínica): Visualización y almacenamiento de reportes diagnósticos con protección estricta.  
  - Módulo 4 (Perfil y Cuidador): Delegación de acceso a familiares cuidadores y revocación explícita de consentimiento.  
- **Decisión Arquitectónica Clave (Auditoría Médica y Soft-Delete):**  
  David Marcet expuso que, en consonancia con la Resolución 1995 de 1999 del Ministerio de Salud y la Ley 1581 de 2012, **los registros médicos no pueden eliminarse físicamente de la base de datos**. Al cancelar una cita o dar de baja un registro, se ejecutará una baja lógica (`is_deleted = true`, `deleted_at = NOW()`), conservando la traza en la base de datos PostgreSQL y en la tabla de logs de auditoría.  
- Se aprobó el script DDL `docs/DATABASE_MODEL_POSTGRESQL.sql` con 8 tablas relacionales fuertemente tipadas y con restricciones de integridad referencial.  

### 3. Acuerdos y Compromisos
| Responsable | Tarea Asignada | Fecha Límite |
| :--- | :--- | :---: |
| David Marcet | Implementar pool PostgreSQL y servicios base para autenticación y agenda. | 11/09/2026 |
| Juan Camilo Ramírez | Diseñar interfaz de navegación mobile y web con soporte de roles de usuario. | 11/09/2026 |
| Francisco Trujillo | Documentar el Diagrama ER y redactar el protocolo de auditoría médica. | 11/09/2026 |

---

# 📝 ACTA N° 03: Cierre de Entregable 1, Seguridad 2FA y Cifrado AES-256-GCM

- **Fecha:** Viernes, 18 de septiembre de 2026  
- **Hora:** 09:00 a. m. – 12:00 m.  
- **Lugar:** Laboratorio de Redes y Seguridad — FET Neiva  
- **Tipo de Sesión:** Ordinaria de Cierre de Entregable 1  
- **Asistentes:** David Marcet Ospina, Juan Camilo Ramírez, Francisco Trujillo Peralta.  

### 1. Orden del Día
1. Verificación del Entregable 1 presentado al docente Miguel Antonio Urbano Silva.  
2. Implementación de seguridad en tránsito (JWT) y doble factor de autenticación (2FA).  
3. Implementación del cifrado en reposo AES-256-GCM para documentos médicos.  
4. Verificación de endpoints de API REST bajo estándar OpenAPI.  

### 2. Desarrollo de la Sesión
- **Aprobación de Entregable 1:** Se consolidó el informe técnico `CONFIGURACION_REPOSITORIO_Y_ENTORNOS.md` y `API_REST_SPECIFICATION.md`.  
- **Seguridad Criptográfica:**  
  David Marcet sustentó el servicio de cifrado simétrico autenticado (`crypto` de Node.js con `AES-256-GCM`, vector de inicialización IV de 16 bytes y tag de autenticación de 16 bytes), garantizando confidencialidad e integridad de las historias clínicas y exámenes de laboratorio.  
- **Autenticación 2FA:** Se integró generación de código TOTP / SMS de 6 dígitos con expiración a 5 minutos para el inicio de sesión.  
- **RBAC (Role-Based Access Control):** Se definieron tres roles: `PATIENT` (titular con control absoluto), `FAMILY` (cuidador delegado con permisos configurables) y `ADMIN` (gestor de contenidos, sin acceso a historias clínicas privadas).  

### 3. Acuerdos y Compromisos
| Responsable | Tarea Asignada | Fecha Límite |
| :--- | :--- | :---: |
| Juan Camilo Ramírez | Implementar pantalla de Login con 2FA interactivo y visor seguro de archivos cifrados. | 25/09/2026 |
| David Marcet | Desarrollar middlewares de verificación de tokens JWT y roles en `/api/v1`. | 25/09/2026 |
| Francisco Trujillo | Diseñar casos de prueba para validación de barreras RBAC y matriz OMS. | 25/09/2026 |

---

# 📝 ACTA N° 04: Culminación Módulo 5 (Tutoriales y Panel Admin) y Verificación OMS

- **Fecha:** Viernes, 02 de octubre de 2026  
- **Hora:** 08:30 a. m. – 11:30 a. m.  
- **Lugar:** Sala de Juntas FET Neiva / Plataforma Virtual  
- **Tipo de Sesión:** Ordinaria de Verificación Técnica de Módulo  
- **Asistentes:** David Marcet Ospina, Juan Camilo Ramírez, Francisco Trujillo Peralta.  

### 1. Orden del Día
1. Revisión de avances en Módulo 5 (Tutoriales SGSSS y Panel Administrativo).  
2. Verificación de enlaces oficiales de trámites para prevenir desinformación.  
3. Verificación de la barrera de seguridad RBAC que aísla al Administrador de las historias clínicas.  
4. Plan de contingencia para persistencia local (`localStorage` fallback) y PostgreSQL.  

### 2. Desarrollo de la Sesión
- Se presentó la interfaz de tutoriales organizada por 4 categorías dinámicas (Agendamiento, Certificados, Autorizaciones e Información General).  
- **Protección contra desinformación:** Todo tutorial incluye verificación del dominio institucional (`.gov.co`, `.comfamiliarhuila.com`, etc.) y advertencia visual preventiva contra sitios fraudulentos.  
- **Panel Administrativo CRUD:** Se habilitó el panel para que el administrador cree, edite o deshabilite guías y categorías.  
- **Test de Verificación RBAC en Vivo:** Se comprobó que el usuario Administrador FET tiene estrictamente **DENEGADO (0%)** el acceso a la agenda personal, medicamentos e historias clínicas privadas de los pacientes.  
- Se redactó el documento formal `MODULO_5_TUTORIALES_Y_ADMINISTRACION.md`.  

### 3. Acuerdos y Compromisos
| Responsable | Tarea Asignada | Fecha Límite |
| :--- | :--- | :---: |
| David Marcet | Preparar endpoints de citas médicas `/api/citas` para Módulo 1. | 08/10/2026 |
| Francisco Trujillo | Desarrollar maquetación y control de citas en AgendaScreen.tsx. | 08/10/2026 |
| Juan Camilo Ramírez | Coordinar pruebas responsive web y móvil para revisión de Semana 7. | 08/10/2026 |

---

# 📝 ACTA N° 05: Retroalimentación del Docente Gestor (09/10/2026) y Plan de Ajustes Inmediatos

- **Fecha:** Viernes, 09 de octubre de 2026  
- **Hora:** 09:30 a. m. – 12:30 p. m.  
- **Lugar:** Laboratorio de Software FET — Asesoría con Docente Miguel Antonio Urbano Silva  
- **Tipo de Sesión:** Extraordinaria de Retroalimentación y Ajustes de Sprint  
- **Docente Gestor Presente:** Ing. Miguel Antonio Urbano Silva  
- **Asistentes:**  
  1. David Marcet Ospina (Backend Lead)  
  2. Juan Camilo Ramírez (Frontend & Mobile Lead)  
  3. Francisco Trujillo Peralta (QA & Tracker Lead)  

### 1. Orden del Día
1. Presentación al docente gestor de los módulos funcionales construidos a Semana 7.  
2. Recepción de observaciones y retroalimentación técnica del docente.  
3. Definición puntual de los 6 requerimientos de ajuste acordados:  
   - Actualización interactiva de fecha al reagendar citas.  
   - Filtrado avanzado de filtros por agenda.  
   - Actualización y edición individual de cada medicamento.  
   - Consolidación de 5 actas oficiales del proyecto.  
   - Documento maestro del Plan de Trabajo.  
   - Documentación de Convocatorias técnicas e institucionales.  
4. Asignación inmediata de tareas y fechas de entrega.  

### 2. Desarrollo de la Sesión y Retroalimentación del Docente
El docente Miguel Antonio Urbano Silva revisó minuciosamente la plataforma GuiaSalud y destacó la robustez del cifrado, el modelo relacional y la interfaz de usuario. No obstante, formuló requerimientos específicos de refinamiento técnico y rigor metodológico:

1. **Actualizar fecha de reagendamiento:**  
   *Observación del docente:* Al seleccionar "Reagendar" en una cita cancelada o completada, el sistema no debe simplemente reactivar el estado; debe solicitar y registrar obligatoriamente la **nueva fecha y nueva hora** de atención, dejando trazabilidad clara en el log de auditoría.  
   *Solución aprobada:* Crear un modal de reagendamiento (`RescheduleModal`) con campos de nueva fecha (`YYYY-MM-DD`, con validación a futuro), nueva hora (`HH:MM`) y notas de reprogramación, actualizando la cita tanto en memoria como en PostgreSQL y emitiendo notificación.

2. **Filtrado de filtros por agenda:**  
   *Observación del docente:* El filtrado de la agenda no puede limitarse a los 7 días de la semana fija. Debe permitir filtrar por rango (Hoy, Esta semana, Este mes, Próximas, Historial pasado), seleccionar libremente cualquier fecha específica con selector nativo, navegar entre semanas con botones Anterior/Siguiente, filtrar por especialidades dinámicas y ver qué filtros están aplicados en una barra de chips con opción de limpieza.  
   *Solución aprobada:* Implementar panel integral de filtrado en [AgendaScreen.tsx](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/src/screens/AgendaScreen.tsx) con control de semana `weekOffset`, selectores de período rápido, input de fecha exacta, dropdown de especialidades y barra interactiva de filtros activos con botón de reinicio.

3. **Actualizar y editar cada medicamento:**  
   *Observación del docente:* En el módulo de medicamentos, los pacientes o cuidadores deben poder actualizar la dosis, frecuencia, duración total, días transcurridos y médico que prescribió la fórmula, no solo crear o eliminar.  
   *Solución aprobada:* Integrar botón y modal de edición ("Editar Medicamento") en [MedicationsScreen.tsx](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/src/screens/MedicationsScreen.tsx), con soporte en [App.tsx](file:///c:/Users/david/OneDrive/Escritorio/GuiaSalud/src/App.tsx) y en los servicios backend (`PUT /api/medications/:id`).

4. **5 Actas hasta hoy:**  
   *Observación del docente:* Toda la trayectoria de toma de decisiones del equipo debe estar debidamente documentada en el libro formal de actas del proyecto.  
   *Solución aprobada:* Consolidar el documento `docs/ACTAS_DE_REUNION_PROYECTO.md` con las 5 actas estructuradas desde la Semana 1 hasta la Semana 7.

5. **Plan de trabajo:**  
   *Observación del docente:* Se requiere el plan de trabajo detallado con cronograma semana a semana (1 a 16), estructura WBS, matriz RACI y plan de contingencia.  
   *Solución aprobada:* Publicar `docs/PLAN_DE_TRABAJO_PROYECTO.md`.

6. **Convocatorias:**  
   *Observación del docente:* Documentar los mecanismos formales de convocatoria del equipo, comités con el docente, convocatorias a pruebas piloto con pacientes y la postulación institucional al semillero y feria de software FET 2026.  
   *Solución aprobada:* Publicar `docs/CONVOCATORIAS_Y_COMITES_PROYECTO.md`.

### 3. Matriz de Compromisos y Cumplimiento de Ajustes
| Requerimiento Acordado | Responsable Técnico | Archivos Afectados | Estado |
| :--- | :--- | :--- | :---: |
| **1. Reagendamiento con fecha y hora** | Francisco Trujillo / David Marcet | `AgendaScreen.tsx`, `App.tsx`, `citas.routes.ts` | **Completado al 100%** |
| **2. Filtrado avanzado por agenda** | Francisco Trujillo / Juan Camilo Ramírez | `AgendaScreen.tsx` | **Completado al 100%** |
| **3. Edición de medicamentos** | Juan Camilo Ramírez / David Marcet | `MedicationsScreen.tsx`, `App.tsx`, `medicationService.ts`, `medication.routes.ts` | **Completado al 100%** |
| **4. Libro de 5 Actas del Proyecto** | David Marcet / Equipo Completo | `docs/ACTAS_DE_REUNION_PROYECTO.md` | **Completado al 100%** |
| **5. Plan de Trabajo Maestro (Sem 1-16)** | Equipo GuiaSalud FET | `docs/PLAN_DE_TRABAJO_PROYECTO.md` | **Completado al 100%** |
| **6. Registro de Convocatorias y Comités** | Francisco Trujillo / Equipo | `docs/CONVOCATORIAS_Y_COMITES_PROYECTO.md` | **Completado al 100%** |

---

# 📝 ACTA N° 06: Motor Automatizado de Alertas, Recordatorios Multicanal y Background Workers

- **Fecha:** Miércoles, 21 de octubre de 2026  
- **Hora:** 08:30 a. m. – 11:30 a. m.  
- **Lugar:** Laboratorio de Software FET / Sala de Coordinación Técnica  
- **Tipo de Sesión:** Ordinaria de Arquitectura e Implementación (Semana 9)  
- **Asistentes:**  
  1. David Marcet Ospina (Backend Lead & DB Architect)  
  2. Juan Camilo Ramírez (Frontend & Mobile Lead)  
  3. Francisco Trujillo Peralta (QA & Security Tracking Lead)  

### 1. Orden del Día
1. Verificación del quórum y balance de compromisos del sprint anterior.  
2. Diseño de la arquitectura de notificaciones multicanal (alertas internas web/móvil, push para dispositivos móviles y correos electrónicos informativos).  
3. Definición y estandarización de plantillas de mensajes para avisos previos de citas médicas (24h y 2h antes) y recordatorios interactivos de tomas de medicamentos.  
4. Lógica de automatización backend: especificación técnica de background workers encargados del sondeo periódico en PostgreSQL.  
5. Definición de endpoints de configuración para que cada paciente gestione y personalice o silencie sus preferencias de notificación.  
6. Asignación de responsabilidades, plan de supervisión de calidad y matriz de compromisos con fecha límite.  

### 2. Desarrollo de la Sesión

El equipo del proyecto **GuiaSalud Versión 1.0** se reunió para coordinar la implementación del motor automatizado de alertas y recordatorios, acordando los siguientes puntos neurálgicos:

- **Diseño de la Arquitectura de Notificaciones:**  
  Se acordó la integración de un servicio multicanal que maneje de forma desacoplada y escalable:
  - **Alertas internas:** Visualizadas en el centro de notificaciones de la plataforma web y la aplicación móvil.
  - **Notificaciones Push:** Enviadas a dispositivos móviles mediante servicio de mensajería (Expo Push / FCM).
  - **Correos Electrónicos Informativos:** Mensajería transaccional enviada al email registrado del usuario o de su cuidador autorizado.  
  Asimismo, se definieron formalmente las plantillas de mensajes para:
  1. *Avisos previos a citas médicas:* Disparo preventivo automatizado a las **24 horas** y a las **2 horas** antes de la hora pautada de la consulta.
  2. *Recordatorios interactivos de tomas de medicamentos:* Notificación con opciones de acción directa ("Tomar dosis", "Posponer 15 min") según el horario y frecuencia posológica prescrita.

- **Lógica de Automatización (Backend):**  
  Se estructuraron los servicios en segundo plano (*background workers / cron tasks*) desarrollados en Node.js/TypeScript encargados de consultar periódicamente en la base de datos PostgreSQL:
  - Citas agendadas con estado `pendiente` dentro de las ventanas temporales de 24h y 2h que no hayan sido notificadas previamente.
  - Horarios de medicamentos activos programados para la hora actual según la frecuencia (ej. cada 8h, 12h, 24h).  
  Se establecieron los endpoints de configuración (`/api/v1/notifications/preferences`) para que cada paciente pueda personalizar los canales deseados o silenciar temporalmente alertas específicas respetando sus derechos de usuario.

- **Asignación de Responsabilidades y Seguimiento:**  
  - **David Marcet Ospina y Juan Camilo Ramírez:** Asumirán el desarrollo del motor en el Backend y la integración del servicio de correo/push, asegurando además la sincronización en tiempo real con la interfaz de usuario.  
  - **Francisco Trujillo Peralta (Tracker):** Supervisará la matriz de pruebas de envío (simulación de ventanas de 24h/2h, verificación de logs de entrega y tasa de recepción) para certificar la entrega del entregable en los tiempos previstos.

### 3. Acuerdos y Compromisos

| Módulo / Tarea | Responsables | Entregable Esperado | Fecha Límite | Estado |
| :--- | :--- | :--- | :---: | :---: |
| **Motor de Notificaciones (Alertas Programadas)** | David Marcet Ospina (Backend) y Juan Camilo Ramírez (Backend/Frontend) | Servicio multicanal operando en segundo plano, envío de correos/push automáticos para citas y medicamentos, e interfaz de preferencias del usuario. | **Jueves, 29 de octubre de 2026** | **En Desarrollo** |
| **Control de Calidad y Pruebas de Envío** | Francisco Trujillo Peralta (QA Tracker) | Protocolo y matriz de pruebas de despacho oportuno (24h/2h), validación de recepción push/email y tolerancia a fallos. | **Jueves, 29 de octubre de 2026** | **En Desarrollo** |

---

### ✍️ Firmas de Conformidad y Aprobación Institucional

```
__________________________________        __________________________________
     David Marcet Ospina                       Juan Camilo Ramírez
Backend Lead & DB Architect                Frontend & Mobile Lead
   FET Neiva - Ing. Software                  FET Neiva - Ing. Software

__________________________________        __________________________________
   Francisco Trujillo Peralta                 Ing. Miguel Antonio Urbano Silva
    QA & Security Tracking                      Docente Gestor / Asesor
   FET Neiva - Ing. Software                 Ingeniería de Software II - FET
```

---

# 📝 ACTA N° 07: Coordinación e Implementación del Módulo de Historia Clínica Personal (Módulo 3)

- **Fecha:** Jueves, 22 de octubre de 2026  
- **Hora:** 08:30 a. m. – 11:15 a. m.  
- **Lugar:** Sala de Trabajo de Proyectos — FET Sede Principal Neiva  
- **Tipo de Sesión:** Ordinaria de Inicio de Módulo Técnico (Semana 10)  
- **Convocante:** Equipo GuiaSalud Versión 1.0  
- **Asistentes:**  
  1. David Marcet Ospina (Backend Lead & DB Architect)  
  2. Juan Camilo Ramírez (Frontend & Mobile Lead)  
  3. Francisco Trujillo Peralta (QA & Tracker Lead)  

### 1. Orden del Día
1. Verificación del quórum reglamentario.  
2. Revisión de avances previos e inicio del **Módulo 3: Historia Clínica Personal**.  
3. Estructuración del Expediente Médico e Interfaz de Usuario (Frontend).  
4. Cifrado en reposo (AES-256-GCM), almacenamiento seguro de archivos adjuntos y control de acceso por roles (RBAC).  
5. Especificación y desarrollo de endpoints de la API REST (`POST /api/historia-clinica`, `GET /api/historia-clinica/adjuntos`, `POST /api/historia-clinica/adjuntos`).  
6. Asignación de responsabilidades, seguimiento con Tracker y definición de fecha límite.  

### 2. Desarrollo de la Sesión

El equipo del proyecto **GuiaSalud Versión 1.0** se reunió para coordinar la implementación del **Módulo de Historia Clínica Personal**, acordando los siguientes aspectos clave:

- **Estructuración del Expediente Médico e Interfaz (Frontend):**  
  - Se diseñó la vista principal del expediente clínico con secciones claramente diferenciadas:
    1. **Antecedentes Médicos Clasificados:** Patológicos, farmacológicos, quirúrgicos, familiares y tóxico-alérgicos.
    2. **Alergias y Contraindicaciones:** Clasificación con nivel de severidad clínica (*Leve*, *Moderada*, *Severa / Anafilaxia*), síntomas de reacción y año de diagnóstico.
    3. **Diagnósticos Previos:** Estructurados con codificación internacional **CIE-10**, estado actual (*Activo*, *En tratamiento*, *Controlado*, *Resuelto*) y profesional de la salud tratante.
    4. **Cronología de Procedimientos:** Línea de tiempo interactiva vertical que consolida cirugías, exámenes diagnósticos y hospitalizaciones con fechas, IPS emisoras y hallazgos.
  - Se acordó la interfaz de carga de archivos adjuntos (PDFs, imágenes de exámenes clínicos o fórmulas médicas) con **vista previa interactiva previa al guardado** y un **motor de búsqueda con filtrado por rango de fechas (Desde - Hasta)** y categorías diagnósticas.

- **Cifrado y Almacenamiento Seguro (Backend):**  
  - Se implementó el servicio de almacenamiento de archivos adjuntos con **cifrado en reposo mediante AES-256-GCM**, vectores de inicialización (IV) de 128 bits, etiquetas de autenticación (authTag) y cálculo de hash de integridad criptográfica **SHA-256** para validar que ningún archivo sea alterado en tránsito o almacenamiento.
  - Se implementó el **Control de Acceso Basado en Roles (RBAC)** en estricto cumplimiento de la Ley Estatutaria 1581 de 2012 (Habeas Data) y lineamientos de ciberseguridad en salud digital de la OMS:
    - **Paciente (Titular):** Acceso integral de consulta y carga sobre su propio expediente.
    - **Familiar Cuidador:** Acceso condicionado al consentimiento informado y permisos delegados expresamente por el paciente.
    - **Médico Tratante / Especialista:** Consulta y registro clínico autorizado.
    - **Administrador (ADMIN):** Acceso estrictamente bloqueado con código HTTP `403 Forbidden` para garantizar la reserva del secreto médico legal.
  - Se desarrollaron y publicaron los endpoints de la API REST para el registro de antecedentes y carga cifrada de documentos:
    - `POST /api/historia-clinica` (registro y actualización de antecedentes, diagnósticos y alergias).
    - `GET /api/historia-clinica` (consulta del expediente con payload cifrado).
    - `GET /api/historia-clinica/adjuntos` (búsqueda y filtrado por rango de fechas y tipo de archivo).
    - `POST /api/historia-clinica/adjuntos` (almacenamiento cifrado con AES-256).
    - `DELETE /api/historia-clinica/adjuntos/:id` (eliminación segura de archivos).
    - `GET /api/historia-clinica/export-pdf` (generación de resumen clínico consolidado en PDF).

- **Asignación de Responsabilidades y Seguimiento:**  
  - **Francisco Trujillo Peralta:** Liderará la maquetación Frontend y, en su rol de Tracker, supervisará el cumplimiento de los hitos y pruebas de carga antes de finalizar la Semana 10.  
  - **David Marcet Ospina y Juan Camilo Ramírez:** Se encargarán del soporte Backend y el esquema de cifrado de archivos en reposo y tránsito.  

### 3. Acuerdos y Compromisos

| Módulo / Tarea | Responsables | Entregable Esperado | Fecha Límite | Estado |
| :--- | :--- | :--- | :---: | :---: |
| **Módulo 3: Historia Clínica Personal** | Francisco Trujillo Peralta (Frontend), David Marcet Ospina (Backend) y Juan Camilo Ramírez (Backend) | Expediente médico personal interactivo con registro de antecedentes/alergias, motor de búsqueda con filtros por fecha y almacenamiento cifrado de archivos adjuntos. | **Jueves, 05 de noviembre de 2026** | **En Desarrollo** |
| **Pruebas de Carga y Cifrado (Semana 10)** | Francisco Trujillo Peralta (Tracker) | Matriz de pruebas de estrés, verificación de tiempos de respuesta en carga de adjuntos y validación de hash SHA-256. | **Jueves, 05 de noviembre de 2026** | **En Desarrollo** |

---

### ✍️ Firmas de Conformidad y Aprobación Institucional

```
__________________________________        __________________________________
     David Marcet Ospina                       Juan Camilo Ramírez
Backend Lead & DB Architect                Frontend & Mobile Lead
   FET Neiva - Ing. Software                  FET Neiva - Ing. Software

__________________________________        __________________________________
   Francisco Trujillo Peralta                 Ing. Miguel Antonio Urbano Silva
    QA & Security Tracking                      Docente Gestor / Asesor
   FET Neiva - Ing. Software                 Ingeniería de Software II - FET
```

