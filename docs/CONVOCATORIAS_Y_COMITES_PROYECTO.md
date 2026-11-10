# 📢 Registro Oficial de Convocatorias y Comités Técnicos
## Proyecto: GuiaSalud Versión 1.0

**Institución:** Fundación Escuela Tecnológica de Neiva (FET)  
**Facultad:** Ingeniería y Ciencias Aplicadas  
**Programa:** Ingeniería de Software  
**Asignatura:** Ingeniería de Software II  
**Docente Gestor / Asesor:** Ing. Miguel Antonio Urbano Silva  
**Período Académico:** 2026-II  
**Equipo de Desarrollo:**  
- **David Marcet Ospina** — Backend Lead & DB Architect  
- **Juan Camilo Ramírez** — Frontend & Mobile Lead  
- **Francisco Trujillo Peralta** — QA & Security Tracking  

---

## 📌 Presentación y Marco Normativo

El presente documento compila formalmente las **Convocatorias Oficiales** emitidas y atendidas por el equipo de ingeniería del proyecto **GuiaSalud Versión 1.0**, que comprenden:
1. **Convocatorias de Comités Internos de Sprint:** Sesiones ordinarias de planificación, integración continua y resolución de deuda técnica entre los desarrolladores.
2. **Convocatorias a Comités de Asesoría y Seguimiento Docente:** Reuniones de control evaluativo y revisión de hitos con el docente gestor Ing. Miguel Antonio Urbano Silva.
3. **Convocatorias a Pruebas de Campo con Usuarios Foco:** Llamado a pacientes con enfermedades crónicas y familiares cuidadores del municipio de Neiva (Huila) para validación de experiencia de usuario (UX) y accesibilidad.
4. **Convocatorias Institucionales de Investigación:** Postulación y participación en la *Convocatoria Interna de Semilleros y Feria de Innovación Tecnológica FET 2026*.

---

## 🗂️ Índice de Convocatorias Formales

| N° | Fecha Emisión | Tipo de Convocatoria | Dirigida a | Propósito / Hito | Estado |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **01** | 18/08/2026 | Comité Técnico Interno | Equipo de Desarrollo | Inicio formal del proyecto y delimitación del alcance general. | **Cumplida** |
| **02** | 15/09/2026 | Asesoría Docente | Docente Miguel Urbano y Equipo | Revisión y sustentación del Entregable 1 (Corte 1). | **Cumplida** |
| **03** | 06/10/2026 | Asesoría y Retroalimentación | Docente Miguel Urbano y Equipo | Evaluación de Semana 7: Agenda, Medicamentos y ajustes técnicos. | **Cumplida** |
| **04** | 09/10/2026 | Convocatoria Institucional FET | Comité de Investigaciones FET | Postulación de GuiaSalud a la Feria de Semilleros e Innovación 2026. | **Radicada** |
| **05** | 10/10/2026 | Pruebas Piloto de Usabilidad | Pacientes y Cuidadores Neiva | Convocatoria a fase de validación de campo con usuarios reales. | **En curso** |
| **06** | 19/10/2026 | Comité Técnico Interno | Equipo de Desarrollo | Coordinación de Arquitectura de Alertas, Push/Email y Background Workers. | **Cumplida** |

---

# 📨 CONVOCATORIA N° 01: Sesión de Apertura y Planificación Inicial del Proyecto

- **Fecha de Emisión:** Martes, 18 de agosto de 2026  
- **Fecha y Hora de la Sesión:** Viernes, 21 de agosto de 2026 — 08:00 a. m.  
- **Lugar:** Laboratorio de Cómputo 3, FET Neiva  
- **Convocados:** David Marcet Ospina, Juan Camilo Ramírez, Francisco Trujillo Peralta.  
- **Carácter:** Obligatorio  

### 📋 Orden del Día Propuesto:
1. Instalación de la mesa de trabajo de Ingeniería de Software II.  
2. Delimitación de roles de desarrollo (Backend, Frontend, QA/Auditoría).  
3. Aprobación del repositorio en GitHub bajo la convención GitFlow.  
4. Adopción del marco de trabajo Scrum adaptado a 8 sprints de 2 semanas.  

### 📌 Resultado de la Convocatoria:
Asistencia del 100% de los convocados. Dio origen al **Acta N° 01** del proyecto GuiaSalud.

---

# 📨 CONVOCATORIA N° 02: Comité de Asesoría Técnica y Sustentación de Entregable 1

- **Fecha de Emisión:** Martes, 15 de septiembre de 2026  
- **Fecha y Hora de la Sesión:** Viernes, 18 de septiembre de 2026 — 09:00 a. m.  
- **Lugar:** Sala de Asesorías Docentes / Laboratorio de Redes FET  
- **Convocante:** Ing. Miguel Antonio Urbano Silva (Docente Gestor)  
- **Convocados:** Equipo de Desarrollo GuiaSalud (Marcet, Ramírez, Trujillo).  

### 📋 Objetivos de la Convocatoria:
1. Presentación formal del informe técnico `CONFIGURACION_REPOSITORIO_Y_ENTORNOS.md`.  
2. Demostración en vivo del pool de conexiones PostgreSQL y del script relacional `DATABASE_MODEL_POSTGRESQL.sql`.  
3. Verificación de seguridad: Endpoints REST bajo especificación OpenAPI, autenticación JWT con 2FA y servicio de cifrado simétrico AES-256-GCM.  

### 📌 Resultado de la Convocatoria:
Entregable 1 evaluado y aprobado satisfactoriamente por el docente gestor. Se dejó constancia en el **Acta N° 03**.

---

# 📨 CONVOCATORIA N° 03: Comité de Retroalimentación de Módulos (Semana 7)

- **Fecha de Emisión:** Martes, 06 de octubre de 2026  
- **Fecha y Hora de la Sesión:** Viernes, 09 de octubre de 2026 — 09:30 a. m.  
- **Lugar:** Laboratorio de Software FET Neiva  
- **Convocante:** Ing. Miguel Antonio Urbano Silva (Docente Gestor)  
- **Convocados:** Equipo de Desarrollo GuiaSalud  

### 📋 Asuntos a Tratar:
1. Demostración del flujo de usuario de Agenda Médica (Módulo 1) y Catálogo de Tutoriales (Módulo 5).  
2. Revisión de las directrices de trazabilidad médica de la OMS y no eliminación física.  
3. Notificación de requerimientos de ajuste y refinamiento metodológico solicitados por la cátedra:
   - Habilitar selección de nueva fecha y hora al reagendar consultas.
   - Expandir los filtros de agenda a rangos temporales, fecha exacta y especialidades.
   - Permitir la edición y actualización integral de cada medicamento.
   - Presentar el consolidado de 5 actas oficiales, el plan de trabajo y el registro de convocatorias.

### 📌 Resultado de la Convocatoria:
Reunión celebrada con éxito; dio origen al **Acta N° 05** y a la implementación de los 6 ajustes acordados.

---

# 📨 CONVOCATORIA N° 04: Postulación a la Convocatoria Institucional de Semilleros e Innovación FET 2026

- **Fecha de Radicación:** Viernes, 09 de octubre de 2026  
- **Entidad Convocante:** Dirección de Investigaciones y Proyección Social — Fundación Escuela Tecnológica de Neiva (FET)  
- **Nombre de la Convocatoria:** *X Convocatoria Interna para el Fortalecimiento de Semilleros de Investigación y Proyectos de Innovación Tecnológica (Feria FET 2026)*  
- **Línea Temática:** Salud Digital, Accesibilidad Web y Transformación Tecnológica en el Huila  
- **Proyecto Postulado:** **GuiaSalud: Plataforma Integral de Salud Digital y Adherencia Farmacológica Cifrada**  

### 📄 Datos de la Postulación:
- **Líder Proponente:** David Marcet Ospina  
- **Co-desarrolladores:** Juan Camilo Ramírez, Francisco Trujillo Peralta  
- **Docente Tutor / Asesor:** Ing. Miguel Antonio Urbano Silva  
- **Impacto Social Esperado:** Reducción del ausentismo en consultas médicas en Neiva y municipios aledaños, incremento del 35% en la adherencia al tratamiento farmacológico en pacientes crónicos mediante recordatorios dinámicos y protección inexpugnable de historias clínicas mediante criptografía moderna.  
- **Estado:** Postulación radicada y preseleccionada para presentación en el estand tecnológico de la Feria FET 2026.

---

# 📨 CONVOCATORIA N° 05: Convocatoria a Sesión de Pruebas de Usabilidad con Usuarios Foco

- **Fecha de Emisión:** Sábado, 10 de octubre de 2026  
- **Período de Aplicación:** Del 17 de octubre al 07 de noviembre de 2026  
- **Población Objetivo:**  
  - 15 Pacientes con diagnóstico de hipertensión arterial o diabetes tipo 2 (mayores de 50 años).  
  - 10 Familiares cuidadores que administren medicamentos o gestionen citas médicas en Neiva.  
- **Lugar de Realización:** Sala de Usabilidad FET y sesiones asistidas en el barrio Las Granjas y Canaima (Neiva).  

### 📋 Protocolo de Validación:
1. **Consentimiento Informado:** Diligenciamiento de autorización de tratamiento de datos personales bajo la Ley 1581 de 2012.  
2. **Prueba de Tareas:**  
   - Tarea A: Agendar una cita médica de cardiología y posteriormente **reagendarla actualizando la fecha y hora**.  
   - Tarea B: Aplicar filtros en la agenda por fecha exacta y por especialidad.  
   - Tarea C: Registrar un medicamento, marcar la toma del día y **editar la dosis o la duración del tratamiento**.  
   - Tarea D: Consultar un tutorial de trámite ante la EPS y verificar el enlace oficial de la entidad.  
3. **Métrica de Evaluación:** Escala de Usabilidad del Sistema (SUS - System Usability Scale) buscando un puntaje objetivo superior a 80/100 puntos.  

---

# 📨 CONVOCATORIA N° 06: Comité Técnico de Arquitectura de Notificaciones y Background Workers

- **Fecha de Emisión:** Lunes, 19 de octubre de 2026  
- **Fecha y Hora de la Sesión:** Miércoles, 21 de octubre de 2026 — 08:30 a. m.  
- **Lugar:** Laboratorio de Software FET / Sala Virtual de Coordinación  
- **Convocados:** David Marcet Ospina, Juan Camilo Ramírez, Francisco Trujillo Peralta.  
- **Carácter:** Obligatorio (Semana 9 de Desarrollo)  

### 📋 Orden del Día Propuesto:
1. Coordinación de la arquitectura del motor de notificaciones multicanal (Alertas web/móvil, Push y Correo).  
2. Definición de plantillas y reglas de disparo para citas médicas (ventanas de 24h y 2h) y medicamentos programados.  
3. Diseño de servicios en segundo plano (*background workers*) y consultas optimizadas a PostgreSQL.  
4. Especificación de endpoints de configuración de preferencias de usuario.  
5. Asignación de responsabilidades y fecha límite de entrega (29 de octubre de 2026).  

### 📌 Resultado de la Convocatoria:
Asistencia del 100% de los miembros del equipo. Se estructuró formalmente el **Acta N° 06** del proyecto GuiaSalud Versión 1.0.

---

### 🏛️ Certificación Institucional

```
El presente libro de convocatorias reposa en la carpeta de documentación oficial 
del proyecto GuiaSalud Versión 1.0 y cuenta con la validez del equipo de desarrollo 
y del docente de la asignatura Ingeniería de Software II.

Neiva (Huila), República de Colombia — Octubre de 2026.
```
