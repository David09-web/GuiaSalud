# 📘 Módulo 5: Tutoriales de Trámites y Panel de Administración Básico
## GuiaSalud Versión 1.0 — Ingeniería de Software II

---

### 📋 Ficha Técnica del Módulo

| Parámetro | Detalle |
| :--- | :--- |
| **Módulo** | Módulo 5: Tutoriales de Trámites y Panel de Administración Básico |
| **Entregable** | Módulo interactivo de consulta de tutoriales con enlaces oficiales verificados y panel de administración para la gestión de contenidos y categorías |
| **Responsables Frontend** | **Juan Camilo Ramírez** (Frontend Lead) & **Francisco Trujillo Peralta** (Frontend Developer & Tracker) |
| **Fecha Límite** | Viernes, 02 de octubre de 2026 (Semana 6) |
| **Estado de Entrega** | **100% Funcional, Verificado e Integrado** |
| **Docente Gestor** | Miguel Antonio Urbano Silva |
| **Institución** | Fundación Escuela Tecnológica de Neiva (FET) |

---

## 1. Constitución Formal del Equipo Multidisciplinario

En concordancia con el ciclo de vida del proyecto **GuiaSalud Versión 1.0**, se formalizó el equipo multidisciplinario asignando las responsabilidades de desarrollo frontend, seguimiento técnico y control de calidad:

- **Juan Camilo Ramírez (Frontend Lead):** Arquitectura y diseño visual de la interfaz de tutoriales, selector dinámico de categorías, flujo interactivo de pasos y checklist interactivo de requisitos previos.
- **Francisco Trujillo Peralta (Frontend & Tracker):** Seguimiento continuo del avance técnico (Semana 6), implementación del panel administrativo básico (crear, editar, deshabilitar contenidos y categorías), pruebas de validación de URLs y verificación del cortafuegos RBAC.
- **David Marcet Ospina (Backend & DB Architect):** Acompañamiento en el modelo de datos relacional y auditoría de eventos de seguridad.

---

## 2. Estructuración del Módulo de Tutoriales de Trámites

El módulo de tutoriales fue concebido para resolver la dispersión de información y los riesgos de desinformación que enfrentan los usuarios del **Sistema General de Seguridad Social en Salud (SGSSS)** en Colombia.

### 2.1 Organización por Categorías Claras
La información está categorizada taxonómicamente mediante filtros en pestañas interactivas:

1. **📅 Agendamiento de Citas:** Guías para la solicitud, reprogramación y confirmación de citas médicas de medicina general, odontología y especialistas en plataformas oficiales de EPS/IPS (Sanitas, Sura, Famisanar, Nueva EPS, etc.).
2. **📄 Certificados de Afiliación:** Pasos para consultar y descargar certificados de afiliación en la Base de Datos Única de Afiliados (BDUA / ADRES) y oficinas virtuales de las aseguradoras con código QR de verificación.
3. **✅ Autorizaciones Médicas:** Trámite para la radicación digital de órdenes médicas, medicamentos no PBS y procedimientos de alta complejidad con número de radicado y plazos de respuesta legal.
4. **🏥 Información General de EPS/IPS:** Consulta de grupo socioeconómico en Sisbén IV, asignación de centros de atención primaria, novedades de afiliación y trámites de portabilidad nacional.

### 2.2 Componentes de Cada Tutorial
Cada tutorial incluye de forma estricta los siguientes elementos funcionales:

- **Explicaciones Paso a Paso:** Acordeón interactivo con descripción detallada de cada etapa, consejos prácticos contextuales (*tips*) y selector de paso activo.
- **Seguimiento de Progreso:** Marcado interactivo de pasos realizados con barra de porcentaje en tiempo real y mensaje de felicitación al completar el 100%.
- **Requisitos Previos Antes de Iniciar:** Checklist interactivo que permite al ciudadano validar que tiene en su poder los documentos exigidos (ej. documento de identidad, orden médica vigente menor a 30 días, historia clínica, etc.) antes de abrir el enlace oficial.
- **Enlaces Oficiales Directamente Verificables:** Validación explícita de dominios autorizados bajo el protocolo seguro HTTPS, previniendo redirecciones maliciosas, páginas espejo o intentos de *phishing*.

---

## 3. Panel de Administración Básico

El panel de administración (`AdminScreen.tsx`) provee a los gestores del sistema las herramientas necesarias para la gobernanza de contenidos sin comprometer la privacidad del paciente.

### 3.1 Funcionalidades Administrativas Habilitadas
- **Creación de Guías:** Formulario completo para registrar nuevo trámite asociando categoría, título, descripción, entidad oficial, URL verificada, requisitos previos y pasos guiados.
- **Edición Completa:** Capacidad de modificar cualquier parámetro de las guías existentes en tiempo real.
- **Deshabilitación / Habilitación Inmediata:** Interruptor (*toggle*) para activar o suspender temporalmente cualquier guía sin eliminar el registro.
- **Gestión de Categorías:** Módulo dedicado para crear nuevas categorías temáticas, editar nombres y descripciones, y habilitar o deshabilitar categorías completas.
- **Auditoría de URLs Oficiales:** Modal de verificación en vivo para auditar la validez del protocolo HTTPS y dominios gubernamentales o institucionales.

### 3.2 Restricciones de Acceso por Roles (RBAC) y Privacidad Médica
Con base en la **Ley Estatutaria 1581 de 2012** (Protección de Datos Personales), la **Resolución 1995 de 1999** (Custodia de Historias Clínicas en Colombia) y las directrices de la **OMS** sobre Salud Digital:

- **Aislamiento Total de Historias Clínicas:** El rol de **Administrador** no tiene acceso a las pantallas ni a los datos de historias clínicas, recetas de medicamentos ni agendas privadas de los pacientes.
- **RBAC Guard en Frontend:** La navegación intercepta cualquier intento de ingreso del Administrador a rutas clínicas restringidas, desplegando una pantalla explicativa de bloqueo con registro inmutable en el registro de auditoría (`AuditLog`).
- **Trazabilidad Inmutable:** Cada acción administrativa (creación de tutorial, edición, cambio de estado, verificación de enlaces o intento de acceso indebido) genera un log con marca de tiempo, IP, usuario y resultado.

---

## 4. Matriz de Control de Acceso (RBAC)

| Recurso / Módulo | Rol Paciente (Titular) | Rol Familiar Cuidador | Rol Administrador |
| :--- | :---: | :---: | :---: |
| **Consultar Tutoriales SGSSS** | Lectura & Progreso | Lectura & Progreso | Lectura Total |
| **Gestión de Tutoriales (CRUD)** | ✕ Sin acceso | ✕ Sin acceso | **✓ Crear, Editar, Deshabilitar** |
| **Gestión de Categorías** | ✕ Sin acceso | ✕ Sin acceso | **✓ Crear, Editar, Deshabilitar** |
| **Verificación de Enlaces Oficiales** | Consumo seguro | Consumo seguro | **✓ Auditoría & Validación** |
| **Historia Clínica Cifrada (AES-256)** | **✓ Acceso Pleno** | Delegado (si autorizado) | **🚫 DENEGADO (0% Acceso)** |
| **Recetas y Medicamentos Privados** | **✓ Acceso Pleno** | Delegado (si autorizado) | **🚫 DENEGADO (0% Acceso)** |
| **Agenda de Citas Médicas del Paciente** | **✓ Acceso Pleno** | Delegado (si autorizado) | **🚫 DENEGADO (0% Acceso)** |

---

## 5. Seguimiento del Tracker Técnico (Semana 6)

El integrante **Francisco Trujillo Peralta** coordinó el tracker de avance técnico, certificando los siguientes hitos al viernes, 02 de octubre de 2026:

```
[x] Hito 5.1: Constitución formal del equipo y asignación de roles.
[x] Hito 5.2: Maquetación del catálogo interactivo de tutoriales con Tailwind CSS v4.
[x] Hito 5.3: Estructuración de las 4 categorías troncales (Citas, Certificados, Autorizaciones, EPS/IPS).
[x] Hito 5.4: Implementación del checklist interactivo de requisitos previos por trámite.
[x] Hito 5.5: Barra de progreso interactiva y acordeón de pasos guiados con tips prácticos.
[x] Hito 5.6: Verificación de enlaces oficiales anti-phishing (ADRES, MinSalud, Supersalud, DNP).
[x] Hito 5.7: Desarrollo del Panel de Administración con CRUD y deshabilitación de tutoriales y categorías.
[x] Hito 5.8: Implementación del cortafuegos RBAC que bloquea el acceso de administradores a historias clínicas.
[x] Hito 5.9: Compilación satisfactoria y pruebas de interfaz en navegador.
```

**Resultado:** Módulo 5 finalizado y entregado exitosamente para la Semana 6 del proyecto GuiaSalud.
