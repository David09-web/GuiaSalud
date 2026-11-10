# 📅 Plan de Trabajo Maestro del Proyecto
## GuiaSalud Versión 1.0 — Plataforma Integral de Salud Digital

**Institución:** Fundación Escuela Tecnológica de Neiva (FET)  
**Facultad:** Ingeniería y Ciencias Aplicadas  
**Programa:** Ingeniería de Software  
**Asignatura:** Ingeniería de Software II  
**Docente Gestor:** Ing. Miguel Antonio Urbano Silva  
**Período Académico:** Segundo Semestre de 2026 (2026-II)  
**Semestre / Nivel:** 7° Semestre  

---

## 👥 Equipo de Trabajo y Liderazgos

| Integrante | Código FET | Rol en el Proyecto | Responsabilidades Principales |
| :--- | :---: | :--- | :--- |
| **David Marcet Ospina** | FET-2023-0104 | **Backend Lead & DB Architect** | API REST Node.js/Express, arquitectura de datos PostgreSQL, cifrado criptográfico AES-256-GCM, seguridad JWT y administración de ramas GitFlow. |
| **Juan Camilo Ramírez** | FET-2023-0118 | **Frontend & Mobile Lead** | Desarrollo web en React 19 + Tailwind CSS v4, aplicación móvil React Native / Expo, experiencia de usuario accesible y diseño UI/UX. |
| **Francisco Trujillo Peralta** | FET-2023-0129 | **QA & Security Tracking** | Calidad de software (QA), planes de prueba funcionales y no funcionales, matriz de riesgos OMS y trazabilidad de auditoría clínica. |

---

## 1. Justificación y Planteamiento del Proyecto

En el contexto del Sistema General de Seguridad Social en Salud (SGSSS) en Colombia, y de manera particular en el departamento del Huila, los pacientes con enfermedades crónicas (hipertensión arterial, diabetes tipo 2, patologías cardiovasculares) y los adultos mayores afrontan severas barreras para:
1. **Mantener la adherencia a sus citas médicas:** Más del 25% de las consultas se pierden por falta de recordatorios accesibles o dificultades para reagendar oportunamente.
2. **Cumplir estrictamente sus tratamientos farmacológicos:** La falta de una bitácora posológica clara y de alertas diarias genera descompensaciones y reingresos hospitalarios evitables.
3. **Custodiar y portar sus historias clínicas:** Los resultados de laboratorio y radiografías se encuentran dispersos en formatos físicos o portales de EPS desarticulados, con nulas garantías de cifrado de extremo a extremo.
4. **Sortear trámites burocráticos:** Desconocimiento de los canales oficiales de EPS y ADRES, exponiendo a los usuarios a desinformación o páginas no autorizadas.

**GuiaSalud Versión 1.0** se concibe como una solución integral de ingeniería de software que articula al paciente, a su familiar cuidador y al equipo de soporte mediante una plataforma web/móvil con altos estándares de seguridad y respeto a la privacidad (Ley 1581 de 2012).

---

## 2. Objetivos del Proyecto

### 2.1 Objetivo General
Diseñar, desarrollar e implementar la plataforma multiplataforma **GuiaSalud Versión 1.0**, que integre agenda médica interactiva con soporte de reagendamiento, control de adherencia terapéutica de medicamentos, custodia cifrada de historia clínica digital mediante AES-256-GCM y un catálogo verificado de trámites del SGSSS, cumpliendo con las directrices de la OMS y los lineamientos de la asignatura Ingeniería de Software II en la FET.

### 2.2 Objetivos Específicos
1. **Modelar e implementar** la arquitectura relacional en PostgreSQL 15 con principios de no eliminación física (soft-delete) para auditoría clínica inmutable.
2. **Construir los servicios de backend y API REST** en Node.js, Express y TypeScript, asegurando autenticación de doble factor (2FA) y control de acceso basado en roles (RBAC).
3. **Desarrollar interfaces de usuario accesibles e intuitivas** en React 19 + Tailwind CSS v4 para web y React Native / Expo para dispositivos móviles Android/iOS.
4. **Implementar los mecanismos de seguridad criptográfica** en reposo (AES-256-GCM) y en tránsito (HTTPS/TLS con JWT), junto con los módulos de consentimiento informado (Habeas Data).
5. **Ejecutar el plan de pruebas integrales** y validar la plataforma con usuarios foco (pacientes y familiares cuidadores) previo a la sustentación académica.

---

## 3. Estructura de Desglose del Trabajo (EDT / WBS)

```
GuiaSalud Versión 1.0
│
├── 1.0 GESTIÓN Y REQUISITOS (Semanas 1 - 3)
│   ├── 1.1 Acta de constitución y asignación de roles
│   ├── 1.2 Especificación de Requisitos de Software (SRS / IEEE 830)
│   └── 1.3 Configuración de repositorios y convención GitFlow
│
├── 2.0 ARQUITECTURA Y BASE DE DATOS (Semanas 3 - 5)
│   ├── 2.1 Modelo Entidad-Relación y script DDL PostgreSQL
│   ├── 2.2 Política de no eliminación física (Soft-Delete) y Logs de Auditoría
│   └── 2.3 Especificación de API REST (OpenAPI 3.0)
│
├── 3.0 DESARROLLO DE MÓDULOS DE NEGOCIO (Semanas 5 - 11)
│   ├── 3.1 Módulo 1: Agenda Médica & Reagendamiento Interactivo
│   │   ├── 3.1.1 Agendamiento estructurado con 6 campos obligatorios
│   │   ├── 3.1.2 Flujo de reagendamiento con actualización de fecha y hora
│   │   └── 3.1.3 Panel de filtrado avanzado por fecha, rango, especialidad y médico
│   ├── 3.2 Módulo 2: Control de Medicamentos & Adherencia
│   │   ├── 3.2.1 Catálogo posológico y barras de progreso
│   │   ├── 3.2.2 Modal y endpoints para editar y actualizar cada medicamento
│   │   └── 3.2.3 Registro de tomas diarias y cálculo de adherencia
│   ├── 3.3 Módulo 3: Historia Clínica Digital Cifrada
│   │   ├── 3.3.1 Servicio de cifrado AES-256-GCM en reposo
│   │   └── 3.3.2 Visor de documentos confidenciales con aislamiento RBAC
│   ├── 3.4 Módulo 4: Perfil, Familiar Cuidador & Habeas Data
│   │   ├── 3.4.1 Delegación de permisos a cuidadores
│   │   └── 3.4.2 Revocación de consentimiento y exportación de datos
│   └── 3.5 Módulo 5: Catálogo de Trámites & Panel Administrativo
│       ├── 3.5.1 Verificación anti-desinformación de URLs institucionales
│       └── 3.5.2 CRUD de tutoriales y categorías con barrera RBAC
│
├── 4.0 CALIDAD, SEGURIDAD Y AUDITORÍA (Semanas 11 - 13)
│   ├── 4.1 Matriz de riesgos de salud digital bajo directrices OMS
│   ├── 4.2 Pruebas unitarias, de integración y penetración básica RBAC
│   └── 4.3 Pruebas de usabilidad en dispositivos móviles (Expo)
│
└── 5.0 PILOTO, MANUALES Y SUSTENTACIÓN FINAL (Semanas 14 - 16)
    ├── 5.1 Despliegue en ambiente productivo y pruebas piloto de campo
    ├── 5.2 Manual de usuario, manual técnico y libro consolidado de actas
    └── 5.3 Sustentación final del proyecto ante el comité docente FET
```

---

## 4. Cronograma Semanal Detallado (Semanas 1 a 16)

| Sem. | Rango de Fechas | Fases / Tareas Clave | Responsable Principal | Entregable Asociado | Estado |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **1** | 18/08 – 22/08/2026 | Constitución del equipo de desarrollo, delimitación de la problemática y selección de tecnologías. | David / Juan / Francisco | Acta N° 01 de conformación | **100%** |
| **2** | 25/08 – 29/08/2026 | Levantamiento de requerimientos funcionales y diseño de historias de usuario. | Francisco Trujillo | Documento de Requisitos | **100%** |
| **3** | 01/09 – 05/09/2026 | Diseño del modelo Entidad-Relación y configuración del entorno GitFlow. | David Marcet | Diagrama ER y Script DDL | **100%** |
| **4** | 08/09 – 12/09/2026 | Maquetación inicial de pantallas web y móvil en Figma y React 19. | Juan Camilo Ramírez | Prototipos navegables | **100%** |
| **5** | 15/09 – 19/09/2026 | **Hito Entregable 1:** Configuración de repositorios, API REST, Cifrado AES-256-GCM y 2FA. | Equipo Completo | Informe Técnico Corte 1 | **100%** |
| **6** | 22/09 – 03/10/2026 | Construcción integral del Módulo 5 (Tutoriales SGSSS y Panel Admin RBAC). | Juan Camilo / Francisco | Módulo 5 y URLs verificadas | **100%** |
| **7** | 06/10 – 10/10/2026 | **Hito Módulo 1:** Agenda Médica con estados, reagendamiento con fecha y filtros avanzados. | David Marcet / Francisco | Agenda con Reagendamiento | **100%** |
| **8** | 13/10 – 17/10/2026 | **Hito Módulo 2:** Actualización y edición individual de medicamentos, cálculo posológico. | Juan Camilo / David | Edición de Medicamentos | **100%** |
| **9** | 20/10 – 24/10/2026 | Integración de aplicación móvil en Expo (Android) con sincronización de agenda y tomas. | Juan Camilo Ramírez | Build APK / Expo Go activo | **En curso** |
| **10** | 27/10 – 31/10/2026 | Módulo 3 y 4: Carga y descarga de archivos clínicos cifrados, delegación a cuidadores. | David Marcet | Cifrado E2E de reportes | **Programado** |
| **11** | 03/11 – 07/11/2026 | **Hito Entregable 2:** Integración completa de los 5 módulos funcionales en Web y Móvil. | Equipo Completo | Informe Técnico Corte 2 | **Programado** |
| **12** | 10/11 – 14/11/2026 | Ejecución de matriz de pruebas funcionales y pruebas de estrés sobre la base PostgreSQL. | Francisco Trujillo | Matriz de pruebas QA | **Programado** |
| **13** | 17/11 – 21/11/2026 | Pruebas de usabilidad con pacientes reales y familiares cuidadores (Neiva, Huila). | Juan Camilo / Francisco | Reporte de feedback de usuario | **Programado** |
| **14** | 24/11 – 28/11/2026 | Corrección de observaciones, optimización de tiempos de carga y auditoría de seguridad. | David Marcet | Optimización de endpoints | **Programado** |
| **15** | 01/12 – 05/12/2026 | Consolidación de manual de usuario, manual de arquitectura y preparación de presentación. | Equipo Completo | Manuales y diapositivas | **Programado** |
| **16** | 08/12 – 12/12/2026 | **Sustentación Final** del proyecto GuiaSalud Versión 1.0 ante el jurado docente de la FET. | David / Juan / Francisco | Presentación y Demo en Vivo | **Programado** |

---

## 5. Matriz RACI de Responsabilidades

> **R:** Responsable de la ejecución (Responsible)  
> **A:** Aprobador final / Rinde cuentas (Accountable)  
> **C:** Consultado (Consulted)  
> **I:** Informado (Informed)  

| Componente / Tarea | David Marcet | Juan Camilo Ramírez | Francisco Trujillo | Docente Miguel Urbano |
| :--- | :---: | :---: | :---: | :---: |
| **Arquitectura de Base de Datos PostgreSQL** | **R / A** | C | C | I |
| **API REST & Middlewares de Seguridad** | **R / A** | C | C | I |
| **Servicio Criptográfico AES-256-GCM** | **R / A** | I | C | I |
| **Frontend Web React 19 + Tailwind v4** | C | **R / A** | C | I |
| **App Móvil React Native / Expo** | C | **R / A** | C | I |
| **Módulo 1: Agenda y Reagendamiento** | R | C | **R / A** | I |
| **Módulo 2: Edición de Medicamentos** | R | **R / A** | C | I |
| **Módulo 5: Tutoriales y Panel Admin** | C | R | **R / A** | I |
| **Plan de Pruebas y Matriz OMS** | C | C | **R / A** | I |
| **Aprobación de Entregables de Corte** | C | C | C | **A** |

---

## 6. Gestión de Riesgos y Plan de Mitigación

| Riesgo Identificado | Nivel | Impacto | Estrategia de Mitigación |
| :--- | :---: | :--- | :--- |
| **Pérdida de conectividad con PostgreSQL en entornos locales** | Medio | Alto | Implementación de almacén fallback en memoria (`localStorage` / mocks) para que la UI funcione plenamente sin caídas durante demostraciones y pruebas offline. |
| **Falla en el agendamiento por solapamiento de horarios** | Bajo | Medio | Validación en cliente y servidor que impide agendar citas con fecha pasada y emite alerta de cruce de horario. |
| **Vulnerabilidad de acceso indebido a historias clínicas** | Alto | Crítico | Cifrado simétrico AES-256-GCM en el backend y validación estricta de barrera RBAC (`DENIED` inmediato al rol Administrador). |
| **Dificultad de lectura en pantallas pequeñas para adultos mayores** | Medio | Alto | Tipografía accesible con contraste formal, textos descriptivos, iconos universales y selector dinámico por colores reconocibles. |

---

## 7. Aprobación y Visto Bueno Institucional

```
Plan de Trabajo formulado y radicado conforme al reglamento académico de la 
Fundación Escuela Tecnológica de Neiva (FET) para la asignatura Ingeniería de Software II.

Neiva, Huila — Octubre de 2026.
```
