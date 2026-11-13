# 🎤 Guión Oficial de Sustentación — GuiaSalud Versión 1.0

**Proyecto:** GuiaSalud Versión 1.0 — Plataforma Integral de Gestión de Citas, Medicamentos e Historia Clínica  
**Asignatura:** Ingeniería de Software II  
**Institución:** Fundación Escuela Tecnológica de Neiva (FET)  
**Docente Gestor:** Ing. Miguel Antonio Urbano Silva  
**Tiempo Total Estimado:** 8 minutos exactos (3 bloques de 2:30 min + 30 seg de cierre)

---

## ⏱️ Cronograma y Distribución de Roles

| Bloque | Tiempo | Responsable | Rol Técnico | Enfoque Principal |
| :--- | :---: | :--- | :--- | :--- |
| **Parte 1** | 00:00 – 02:30 | **Juan Camilo Ramírez** | *Frontend & Mobile Lead* | Problema SGSSS, Objetivos, Arquitectura PWA, Login 2FA y Dashboard |
| **Parte 2** | 02:30 – 05:00 | **David Marcet Ospina** | *Backend Lead & DB Architect* | API REST, PostgreSQL, Agenda Médica, Adherencia de Medicinas e Historia Clínica |
| **Parte 3** | 05:00 – 07:30 | **Francisco Trujillo Peralta** | *QA & Security Tracking* | Validaciones estrictas, Habeas Data, Trámites SGSSS, Panel Admin y Auditoría |
| **Parte 4** | 07:30 – 08:00 | **Equipo (Los 3)** | *Equipo de Ingeniería* | Síntesis, conclusiones técnicas y apertura a preguntas |

---

## 👤 PARTE 1: Planteamiento, Objetivos, Arquitectura PWA e Inicio
* **Responsable:** Juan Camilo Ramírez (*Frontend & Mobile Lead*)  
* **Tiempo asignado:** 00:00 – 02:30 (2 min 30 seg)

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Tener abierta la aplicación en modo móvil responsivo (emulador móvil o celular físico conectado) en la pantalla de **Login / Iniciar Sesión**.

### 🗣️ Discurso:
> "Buenos días / tardes, profesor y compañeros. Hoy presentamos **GuiaSalud Versión 1.0**, una aplicación progresiva (PWA) nacida para resolver tres problemas críticos del sistema de salud colombiano (SGSSS): la alta inasistencia a citas médicas, la baja adherencia a tratamientos farmacológicos y la fragmentación de la historia clínica junto al desconocimiento de trámites ante EPS y ADRES.
>
> Nuestro **Objetivo General** es centralizar la autogestión médica del paciente y su núcleo familiar mediante una plataforma segura, accesible e interoperable. Para lograrlo, cumplimos tres **Objetivos Específicos**:
> 1. Primero, automatizar recordatorios multicanal de citas y medicamentos;
> 2. Segundo, proteger la confidencialidad clínica bajo la Ley 1581 de Habeas Data; y
> 3. Tercero, democratizar el acceso a guías oficiales de tramitología en salud.
>
> A nivel de interfaz, construimos una PWA con **React y Tailwind CSS**, lo que permite instalarla directamente en cualquier smartphone sin depender de tiendas de aplicaciones, operando con notificaciones push y soporte offline."

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Seleccionar el usuario demo, ingresar credenciales y entrar directamente al **Dashboard**.

### 🗣️ Discurso:
> "Al ingresar al Dashboard Principal, el paciente visualiza su resumen diario, accesos rápidos a emergencias y el sistema **Due Action**, que lanza alertas interactivas en tiempo real cuando se cumple la hora de una consulta o toma médica.
>
> Doy paso a mi compañero David, quien mostrará el funcionamiento interno de los módulos clínicos."

---

## 👤 PARTE 2: Backend, Agenda, Farmacología e Historia Clínica
* **Responsable:** David Marcet Ospina (*Backend Lead & DB Architect*)  
* **Tiempo asignado:** 02:30 – 05:00 (2 min 30 seg)

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Tocar la pestaña **'Agenda'** en el menú inferior.

### 🗣️ Discurso:
> "Gracias, Juan Camilo. Detrás de esta interfaz opera una **API REST en Node.js, Express y TypeScript** conectada a **PostgreSQL** bajo arquitectura de borrado lógico (*soft-delete*) y trazabilidad completa.
>
> En el **Módulo de Agenda Médica**, el paciente filtra sus citas por estado (*Pendientes, Realizadas o Canceladas*) o por especialidad. Al crear o reprogramar una cita..."

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Abrir **'+ Nueva Cita'**, mostrar brevemente los campos y tocar el botón de recordatorio por WhatsApp.

### 🗣️ Discurso:
> "...el backend sincroniza el evento y habilita el envío directo de recordatorios estructurados por WhatsApp tanto al paciente como a su familiar cuidador autorizado.
>
> Pasemos ahora al **Módulo de Control de Medicamentos**."

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Tocar la pestaña **'Medicinas'** y pulsar **'✓ Tomada'** en un fármaco.

### 🗣️ Discurso:
> "Aquí el sistema calcula en tiempo real el porcentaje de adherencia terapéutica cada vez que se marca una toma y descuenta el inventario disponible. Además, integra un algoritmo preventivo: cuando el tratamiento supera el 80% de su duración, emite una alerta para renovar la fórmula médica ante la EPS antes de quedarse sin medicación.
>
> Por último, en el **Módulo de Historia Clínica**..."

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Tocar la pestaña **'Historial'**, mostrar la bóveda cifrada y pulsar **'Exportar PDF'**.

### 🗣️ Discurso:
> "...el paciente resguarda sus diagnósticos CIE-10, alergias y exámenes bajo cifrado AES-256. Con un toque en **'Exportar PDF'**, compilamos un reporte médico estandarizado listo para entregar en consulta o imprimir.
>
> Cedo la palabra a Francisco para exponer las validaciones, el módulo de trámites y el control de calidad."

---

## 👤 PARTE 3: Validaciones, Trámites SGSSS, Rol Admin y QA
* **Responsable:** Francisco Trujillo Peralta (*QA & Security Tracking*)  
* **Tiempo asignado:** 05:00 – 07:30 (2 min 30 seg)

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Ir a **'Perfil'** &rarr; editar un dato o abrir el formulario de Familiar Autorizado.

### 🗣️ Discurso:
> "Gracias, David. Desde el aseguramiento de calidad (QA) y gestión de riesgos, blindamos cada formulario de la aplicación con reglas de validación estrictas tanto en Frontend como en Backend:
>
> - En nombres y parentescos bloqueamos números o caracteres especiales, exigiendo longitud mínima y texto alfabético limpio.
> - En teléfonos exigimos exactamente 10 dígitos numéricos válidos para Colombia.
> - En fechas impedimos programar citas en días pasados o fechas de nacimiento futuras, y aplicamos sanitización contra inyección XSS y SQL en observaciones clínicas.
>
> Asimismo, en el perfil implementamos los permisos granulares para Familiares Cuidadores y los derechos de Habeas Data, permitiendo descargar toda la información en JSON o revocar el consentimiento.
>
> Ahora veamos el **Módulo de Trámites y Tutoriales**."

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Tocar la pestaña **'Trámites'** y desplegar una guía oficial.

### 🗣️ Discurso:
> "Para combatir la desinformación en salud, centralizamos guías paso a paso con enlaces oficiales verificados (.gov.co) para consultas en ADRES, traslados de EPS y solicitud de historia clínica.
>
> Finalmente, ingresando con el **Rol Administrador**..."

---

### 🎬 Indicación técnica en pantalla:
> **[ACCIÓN EN PANTALLA]:** Cambiar al rol Administrador / mostrar la vista `AdminScreen` y la bitácora.

### 🗣️ Discurso:
> "...aplicamos el principio de mínimo privilegio (RBAC): el administrador gestiona las guías institucionales pero tiene bloqueado el acceso a historias clínicas o recetas de pacientes. En su lugar, supervisa métricas globales y la **Bitácora Inmutable de Auditoría**, donde cada inserción, edición o eliminación queda registrada con fecha, usuario e IP."

---

## 👥 PARTE 4: Cierre Institucional
* **Tiempo asignado:** 07:30 – 08:00 (30 segundos)  
* **Responsables:** Los 3 integrantes

---

### 🗣️ Diálogo de Cierre:
- **Juan Camilo:** *"En síntesis, GuiaSalud v1.0 lleva la gestión clínica y preventiva directamente al bolsillo del paciente y su familia."*
- **David Marcet:** *"Todo respaldado por una arquitectura escalable, cifrada y alineada con la interoperabilidad en salud."*
- **Francisco Trujillo:** *"Cumpliendo con el 100% de los objetivos planteados y las pruebas de calidad de Ingeniería de Software II. Quedamos atentos a sus preguntas."*

---

## 🎯 Batería de Posibles Preguntas del Docente / Jurado

1. **¿Cómo garantizan que un Administrador no lea los datos clínicos de un paciente?**  
   *Respuesta sugerida (David / Francisco):* "Implementamos RBAC (Role-Based Access Control) estricto en los middlewares de Express y a nivel de base de datos. El rol Administrador únicamente tiene permisos de lectura sobre métricas agregadas y tablas de auditoría/guías de trámites; los endpoints de `/api/historia-clinica` y `/api/medicamentos` exigen token de sesión asociado al ID propio del paciente o cuidador autorizado con llave AES-256."

2. **¿Por qué eligieron una PWA en lugar de una app nativa en Flutter o Kotlin?**  
   *Respuesta sugerida (Juan Camilo):* "Por accesibilidad e inclusión digital en salud. Una PWA elimina la fricción de espacio de almacenamiento en teléfonos de gama baja o media de los adultos mayores, permite actualizaciones inmediatas sin aprobación de tiendas, y mantiene capacidades nativas críticas como notificaciones push y uso sin conexión a internet mediante Service Workers."

3. **¿Qué tipo de pruebas realizaron y cómo validaron los formularios?**  
   *Respuesta sugerida (Francisco):* "Ejecutamos pruebas unitarias automatizadas con Node.js y React Testing Library verificando límites de expresiones regulares (RegEx) para impedir caracteres aleatorios, inyecciones de código y números en nombres propios. Además, aplicamos una matriz de riesgos alineada con lineamientos de la OMS para seguridad del paciente."
