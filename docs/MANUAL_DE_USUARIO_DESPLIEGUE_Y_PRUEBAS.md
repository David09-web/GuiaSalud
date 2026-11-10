# Manual Integral de Usuario, Despliegue y Pruebas de Software - GuiaSalud v1.0

**Proyecto:** GuiaSalud Versión 1.0 — Plataforma Integral de Gestión de Citas, Medicamentos e Historia Clínica  
**Asignatura:** Ingeniería de Software II  
**Institución:** Fundación Escuela Tecnológica de Neiva (FET)  
**Docente Gestor:** Ing. Miguel Antonio Urbano Silva  
**Equipo de Desarrollo:**  
- **David Marcet Ospina** (Líder Backend & DevOps)  
- **Juan Camilo Ramírez** (Líder Frontend & Auditoría UI)  
- **Francisco Trujillo Peralta** (Tracker, Calidad QA & Matriz de Riesgos)  

---

## 📑 Tabla de Contenido
1. [Introducción y Objetivos](#1-introducción-y-objetivos)
2. [Manual de Usuario por Roles](#2-manual-de-usuario-por-roles)
   - [2.1 Flujo de Acceso y Autenticación con 2FA](#21-flujo-de-acceso-y-autenticación-con-2fa)
   - [2.2 Rol Paciente (Módulos 1 al 4)](#22-rol-paciente-módulos-1-al-4)
   - [2.3 Rol Familiar Cuidador (Acompañamiento y Delegación)](#23-rol-familiar-cuidador-acompañamiento-y-delegación)
   - [2.4 Módulo 5: Tutoriales de Trámites en Salud (SGSSS)](#24-módulo-5-tutoriales-de-trámites-en-salud-sgsss)
   - [2.5 Rol Administrador (Gestión de Guías y Auditoría SGSSS)](#25-rol-administrador-gestión-de-guías-y-auditoría-sgsss)
3. [Manual de Despliegue Técnico](#3-manual-de-despliegue-técnico)
   - [3.1 Requisitos Previos del Sistema](#31-requisitos-previos-del-sistema)
   - [3.2 Configuración del Entorno y Variables (.env)](#32-configuración-del-entorno-y-variables-env)
   - [3.3 Despliegue Local (Desarrollo y Pruebas)](#33-despliegue-local-desarrollo-y-pruebas)
   - [3.4 Despliegue a Producción Móvil con Túnel HTTPS (Ngrok / Cloud)](#34-despliegue-a-producción-móvil-con-túnel-https-ngrok--cloud)
   - [3.5 Instalación PWA en Dispositivos Móviles (iOS y Android)](#35-instalación-pwa-en-dispositivos-móviles-ios-y-android)
4. [Manual y Protocolo de Pruebas de Software (QA)](#4-manual-y-protocolo-de-pruebas-de-software-qa)
   - [4.1 Estrategia de Pruebas](#41-estrategia-de-pruebas)
   - [4.2 Matriz Detallada de Casos de Prueba Funcionales](#42-matriz-detallada-de-casos-de-prueba-funcionales)
   - [4.3 Pruebas de Notificaciones Push y Segundo Plano Móvil](#43-pruebas-de-notificaciones-push-y-segundo-plano-móvil)
   - [4.4 Pruebas de Seguridad, RBAC y Habeas Data (Ley 1581)](#44-pruebas-de-seguridad-rbac-y-habeas-data-ley-1581)
5. [Solución de Problemas Comunes (Troubleshooting)](#5-solución-de-problemas-comunes-troubleshooting)

---

## 1. Introducción y Objetivos

**GuiaSalud** es una solución tecnológica integral de salud digital orientada a pacientes colombianos, cuidadores familiares e instituciones prestadoras de salud. Nace para mitigar tres problemáticas críticas identificadas en el SGSSS:
1. **La dispersión e inasistencia a citas médicas programadas** (generando pérdidas de citas y sobrecostos asistenciales).
2. **La baja adherencia a tratamientos farmacológicos crónicos** y el descontrol en la toma de medicamentos.
3. **La fragmentación de la historia clínica personal** y la falta de canales oficiales seguros y verificados para tramitología.

Este documento consolida la guía completa de operación de usuario, las directrices de despliegue para administradores de sistemas y la batería de pruebas para certificar la estabilidad, seguridad y rendimiento del sistema.

---

## 2. Manual de Usuario por Roles

### 2.1 Flujo de Acceso y Autenticación con 2FA
1. Ingrese a la URL oficial o abra la PWA instalada en su teléfono.
2. En la pantalla de **Iniciar Sesión**:
   - Seleccione el usuario demo o ingrese sus credenciales (Correo y Contraseña).
   - Opcionalmente seleccione el rol de inicio: `Paciente`, `Familiar Cuidador` o `Administrador`.
3. **Segundo Factor de Autenticación (2FA):**
   - El sistema solicitará un código de verificación de 6 dígitos enviado por seguridad.
   - Ingrese el código (ej: `123456`) para acceder al sistema.
   - La sesión permanecerá activa de forma segura y persistente en el dispositivo.

---

### 2.2 Rol Paciente (Módulos 1 al 4)

#### A. Módulo de Inicio (Dashboard General)
- **Tarjeta de Bienvenida:** Saludo interactivo con fecha actual y acceso rápido a resumen de salud.
- **Acción Pendiente (Alerta Due):** Si la hora de una cita o toma de medicamento se cumplió, aparece una ventana emergente interactiva para confirmar toma o asistencia.
- **Resumen Semanal:** Visualice próximas citas, medicamentos del día y botones rápidos a WhatsApp y emergencias.

#### B. Módulo 1: Agenda Médica y Citas
1. **Ver Citas:** Desplácese por el selector de días de la semana o vea la lista completa.
2. **Filtrar:** Filtre por estado (`Todas`, `Pendientes`, `Realizadas`, `Canceladas`) o por especialidad médica.
3. **Agendar Nueva Cita:**
   - Toque el botón **"+ Nueva Cita"**.
   - Complete la especialidad médica, profesional, IPS sede, fecha, hora y notas de preparación.
   - Pulse **"Guardar Cita"**. Se sincronizará automáticamente con el calendario y el backend.
4. **Acciones Rápidas:**
   - Puede reprogramar fecha u hora.
   - Marcar como **"Realizada"** (cambia a verde) o **"Cancelar"**.
   - Presionar el icono de WhatsApp para enviar recordatorio automático con plantilla oficial al celular.

#### C. Módulo 2: Control de Medicamentos y Adherencia
1. **Lista de Tratamientos:** Muestra el nombre comercial, dosis, presentación, frecuencia y médico tratante.
2. **Marcación de Tomas del Día:**
   - Pulse **"✓ Tomada"** cuando ingiera la dosis (suma a la barra de adherencia).
   - Pulse **"✗ Omitida"** si no pudo tomarla (registra motivo para el médico).
3. **Detección de Fin de Tratamiento:** Si el tratamiento supera el 80% del tiempo estipulado, la app genera un distintivo de advertencia invitando a renovar la fórmula médica ante la EPS.
4. **Nueva Receta:** Permite ingresar nuevos fármacos indicando fecha de inicio, duración en días y horas de toma.

#### D. Módulo 3: Historia Clínica y Bóveda Documental
1. **Resumen Clínico:** Grupo sanguíneo y factor RH, EPS, IPS Primaria, alergias y diagnósticos crónicos (CIE-10).
2. **Bóveda de Documentos:**
   - Visualice órdenes, resultados de laboratorio y ecografías con sello de cifrado AES-256.
   - Toque **"Ver"** para abrir el visor interactivo de exámenes y descargarlos.
3. **Exportar Reporte Médico Formal:**
   - Toque el botón **"Exportar PDF"**.
   - Se abre el documento estandarizado listo para imprimir o compartir con el médico en consulta.

#### E. Módulo 4: Perfil y Gestión de Familiares
1. **Datos Personales:** Modifique su teléfono, dirección, correo y EPS/IPS con validación estricta.
2. **Familiar Autorizado (Cuidador):**
   - **Agregar Familiar:** Registre familiares ingresando su parentesco y teléfono de WhatsApp.
   - **Editar Familiar:** Toque el icono de lápiz azul para modificar nombres, teléfonos, rol o estado (Autorizado / Pendiente).
   - **Eliminar Familiar:** Toque el icono de papelera roja para revocar el acceso del cuidador tras confirmación segura.
   - **Permisos Granulares:** Active o desactive de forma independiente: *Ver Agenda*, *Ver Medicamentos*, *Recibir Alertas* o *Ver Historia Clínica*.
3. **Habeas Data (Ley 1581 de 2012):**
   - Descargue todos sus datos en formato abierto JSON.
   - Botón de **Revocar Consentimiento** para congelar el tratamiento de datos personales.

---

### 2.3 Rol Familiar Cuidador (Acompañamiento y Delegación)
- Al ingresar con este rol, una barra superior verde indica **"Modo Familiar Autorizado: Cuidando a [Nombre del Paciente]"**.
- El familiar tiene habilitadas únicamente las secciones que el paciente le autorizó mediante los interruptores de permisos.
- Si no tiene autorizado ver historia clínica, el sistema oculta la información sensible respetando el principio de mínimo privilegio.

---

### 2.4 Módulo 5: Tutoriales de Trámites en Salud (SGSSS)

El Módulo de **Tutoriales de Trámites** está diseñado para guiar paso a paso a pacientes y cuidadores en la realización de diligencias ante el Sistema General de Seguridad Social en Salud (SGSSS) de Colombia, combatiendo la desinformación y el phishing mediante enlaces oficiales certificados.

#### A. Organización por Categorías
Los trámites se organizan taxonómicamente mediante filtros interactivos:
1. **📅 Agendamiento de Citas:** Pasos para programar citas de medicina general, odontología o especialistas en las principales EPS (Sanitas, Sura, Famisanar, Nueva EPS, Salud Total, Compensar).
2. **📄 Certificados de Afiliación:** Consulta y descarga oficial del estado BDUA / ADRES y certificados EPS con código de validación.
3. **✅ Autorizaciones Médicas:** Radicación virtual de órdenes médicas, medicamentos PBS/no PBS y servicios especializados con seguimiento de radicado.
4. **🏥 Información General de EPS/IPS:** Consulta de grupo en Sisbén IV, régimen subsidiado/contributivo, portabilidad nacional y cambio de IPS primaria.

#### B. Flujo de Consulta de un Tutorial
1. **Selección del Trámite:** Desde el menú inferior o lateral, ingrese a la pestaña **Tutoriales** y seleccione el trámite de su interés.
2. **Requisitos Previos Antes de Iniciar (Checklist Interactivo):**
   - Antes de iniciar el trámite, el sistema presenta un listado de documentos indispensables (ej: cédula original, orden médica menor a 30 días, etc.).
   - El usuario puede marcar cada casilla para verificar que tiene todo listo antes de acceder a la entidad.
3. **Pasos Guiados con Barra de Progreso:**
   - Cada paso se presenta en un acordeón interactivo con explicaciones claras y **tips prácticos** (consejos de seguridad, horarios de atención, canales alternos).
   - A medida que el usuario marca pasos completados, la barra de progreso avanza hasta alcanzar el 100%.
4. **Acceso a Canales Oficiales Verificados (Anti-Phishing):**
   - Cada tutorial cuenta con un botón directo al **Portal Oficial Verificado** con protocolo HTTPS estricto y entidades del Estado (ADRES, MinSalud, Superintendencia Nacional de Salud, DNP).
   - Opción de **"Copiar URL"** para pegarla en el navegador si el usuario prefiere no salir de la aplicación.

---

### 2.5 Rol Administrador (Gestión de Guías y Auditoría SGSSS)
1. **Acceso al Panel:** Ingrese con el rol `ADMIN` (ej: Ing. FET o Gestor SGSSS) desde el selector de rol.
2. **Política de Privacidad Estricta (RBAC):** Por diseño ético y legal (Ley 1581 y OMS), el administrador **no tiene acceso a ver nombres de pacientes, historias clínicas ni recetas**.
3. **Gestión Administrativa de Tutoriales:**
   - **Crear Nuevo Trámite:** Botón "+ Nuevo Tutorial" para diligenciar título, categoría, descripción, entidad oficial, URL verificada, lista de requisitos previos y pasos guiados con tips.
   - **Editar Guías Existentes:** Modificar textos, enlaces desactualizados o agregar nuevos pasos.
   - **Habilitar / Deshabilitar:** Interruptor para pausar temporalmente una guía sin eliminar el registro histórico.
   - **Gestión de Categorías:** Crear, editar o deshabilitar categorías completas de trámites.
   - **Auditoría de URLs Oficiales:** Herramienta para probar la validez y vigencia de las páginas oficiales del SGSSS en tiempo real.
4. **Bitácora Inmutable de Auditoría:**
   - Visualización de logs de eventos: accesos, cambios de datos, modificaciones de roles e intentos de acceso indebido, con fecha, hora, IP y acción.

---

## 3. Manual de Despliegue Técnico

### 3.1 Requisitos Previos del Sistema
- **Node.js:** Versión 18.0.0 LTS o superior (recomendado v20.x o v24.x).
- **Gestor de paquetes:** `npm` (v9+) o `pnpm`.
- **Navegador web moderno:** Google Chrome, Safari Mobile, Mozilla Firefox, Microsoft Edge o Brave.
- **Herramienta de exposición pública (opcional para pruebas en celular):** `ngrok` instalado y autenticado con token.

---

### 3.2 Configuración del Entorno y Variables (.env)

#### En el Frontend (Raíz):
Cree o verifique el archivo `.env` en la raíz si requiere personalizar puertos:
```env
PORT=8443
VITE_API_URL=http://localhost:5000/api/v1
```

#### En el Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=guiasalud_jwt_secret_ultra_seguro_2026
VAPID_PUBLIC_KEY=BEe8hyHCXhhaerBwQuzCvD-K8ak2xv0DfyMHnDdy0ap9ahDsajAQ0mRr1AQfx5lVQhhSr6bc4D-uArtuW2AOJ-Q
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:soporte@guiasalud.fet.edu.co
```

---

### 3.3 Despliegue Local (Desarrollo y Pruebas)

El sistema consta de dos servicios independientes que se ejecutan simultáneamente:

#### Paso 1: Iniciar el Backend API
Abra una primera terminal:
```powershell
cd backend
npm install
npm run dev
```
*El backend quedará escuchando en `http://localhost:5000` con sus endpoints `/api/v1/health`, `/api/v1/agenda`, `/api/v1/medications`, etc.*

#### Paso 2: Iniciar el Frontend
Abra una segunda terminal:
```powershell
npm install
npm run dev
```
*La aplicación web estará disponible en `http://localhost:8443`.*

---

### 3.4 Despliegue a Producción Móvil con Túnel HTTPS (Ngrok / Cloud)

Para que las notificaciones en segundo plano (**Apple Push Notification service - APNs** y **Web Push**) funcionen en celulares, la aplicación debe servirse bajo protocolo **HTTPS estricto**.

#### Paso 1: Generar el paquete optimizado de producción
```powershell
npm run build
```

#### Paso 2: Servir la versión compilada a alta velocidad
```powershell
npx vite preview --port 8443 --host 0.0.0.0
```

#### Paso 3: Iniciar el Túnel HTTPS con Ngrok
Abra una tercera terminal:
```powershell
ngrok http 8443
```
*Ngrok arrojará una URL pública segura (ej: `https://diffusive-feeble-uncoated.ngrok-free.dev`).*

---

### 3.5 Instalación PWA en Dispositivos Móviles (iOS y Android)

#### En iPhone / iPad (Safari):
1. Abra la URL pública generada por Ngrok en Safari.
2. Si aparece el aviso preliminar de Ngrok, pulse **"Visit Site"**.
3. En la barra inferior de Safari, presione el botón de **Compartir** (icono cuadrado con flecha hacia arriba).
4. Desplácese hacia abajo y elija **"Agregar al inicio"** (*Add to Home Screen*).
5. Asigne el nombre **GuiaSalud** y pulse **Agregar**.
6. Abra la aplicación directamente desde el icono de su pantalla de inicio.

#### En Android (Chrome / Brave / Edge):
1. Ingrese a la URL en el navegador móvil.
2. Pulse en el aviso inferior **"Instalar GuiaSalud en la pantalla principal"** o toque los tres puntos verticales y elija **"Instalar aplicación"**.

---

## 4. Manual y Protocolo de Pruebas de Software (QA)

### 4.1 Estrategia de Pruebas
Se implementó una estrategia multinivel:
- **Pruebas Unitarias y de Integración:** Verificación de controladores Express y cálculos de adherencia farmacológica.
- **Pruebas de Seguridad y RBAC:** Comprobación de denegación de acceso para roles no autorizados.
- **Pruebas de Rendimiento Móvil:** Evaluación de tiempos de carga en red móvil mediante paquetes minificados (< 150 KB gzip).
- **Pruebas de Notificaciones Push:** Certificación de entrega de recordatorios en pantalla de bloqueo.

---

### 4.2 Matriz Detallada de Casos de Prueba Funcionales

| ID Caso | Módulo | Acción del Evaluador | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **CP-001** | Autenticación | Iniciar sesión ingresando credenciales y código 2FA de 6 dígitos. | Acceso autorizado al dashboard; persistencia de token en sesión. | **EXITOSO** |
| **CP-002** | Seguridad RBAC | Cambiar al rol Administrador e intentar abrir la pantalla de Historia Clínica. | Pantalla de bloqueo con mensaje: *"Acceso Restringido por Política RBAC / Principio de Mínimo Privilegio"*. | **EXITOSO** |
| **CP-003** | Agenda Médica | Crear una nueva cita con fecha de mañana y médico especialista. | La cita se agrega en estado `Pendiente`, visible en calendario e inicio. | **EXITOSO** |
| **CP-004** | Agenda Médica | Cambiar estado de cita médica a `Realizada` o `Cancelada`. | La cita actualiza su color distintivo y se registra en la bitácora de auditoría. | **EXITOSO** |
| **CP-005** | Medicamentos | Marcar toma del día como `✓ Tomada` o `✗ Omitida`. | El porcentaje de adherencia se actualiza en tiempo real y registra la hora. | **EXITOSO** |
| **CP-006** | Medicamentos | Registrar medicamento con avance mayor al 80% del tratamiento. | Despliegue de insignia de advertencia: *"Fin de tratamiento próximo. Renovar fórmula"*. | **EXITOSO** |
| **CP-007** | Historia Clínica | Abrir visor de archivos de exámenes diagnósticos (Laboratorio / Rayos X). | Apertura modal del visor protegido con sello de cifrado AES-256. | **EXITOSO** |
| **CP-008** | Historia Clínica | Pulsar el botón **"Exportar PDF"** de la historia clínica. | Generación y previsualización del informe médico formal listo para impresión. | **EXITOSO** |
| **CP-009** | Familiares | Agregar un nuevo familiar autorizado indicando parentesco y número móvil. | El familiar aparece en la lista con estado `Autorizado` y permisos por defecto. | **EXITOSO** |
| **CP-010** | Familiares | Pulsar el botón de lápiz azul (Editar familiar) y cambiar teléfono y parentesco. | Los datos se actualizan inmediatamente y persisten tras recargar. | **EXITOSO** |
| **CP-011** | Familiares | Pulsar el botón de papelera roja (Eliminar familiar) y confirmar en el modal. | El familiar es removido de la lista y se revocan todos sus permisos. | **EXITOSO** |
| **CP-012** | Habeas Data | Hacer clic en **"Descargar Mis Datos (JSON)"** en la sección Perfil. | Se descarga el archivo plano estructurado con todos los registros del usuario. | **EXITOSO** |

---

### 4.3 Pruebas de Notificaciones Push y Segundo Plano Móvil

1. **Prueba de Suscripción:**
   - En la aplicación móvil, pulse el icono de campana 🔔 o abra el modal de notificaciones.
   - Toque **"Activar Notificaciones"** y conceda el permiso en el diálogo del sistema operativo.
   - El sistema registra la suscripción VAPID ante el backend `/api/v1/notifications/subscribe`.
2. **Prueba de Notificación Inmediata en 5 Segundos:**
   - En el modal de notificaciones, pulse **"Probar Notificación en 5s"**.
   - Bloquee la pantalla del celular o salga de la aplicación al menú de inicio.
   - A los 5 segundos, el servidor envía un paquete Web Push al servicio de Apple/Google despertando la pantalla con el sonido y banner de GuiaSalud.

---

### 4.4 Pruebas de Seguridad, RBAC y Habeas Data (Ley 1581)

- **Cifrado en Tránsito:** Verificado con SSL/TLS clase A a través de túnel HTTPS.
- **Aislamiento de Usuarios:** La información de medicamentos, citas y familiares se almacena particionada bajo llaves identificadas por ID de usuario (`guiasalud_session`, `guiasalud_appts_usr-001`, `guiasalud_caregivers_usr-001`).
- **Trazabilidad:** Cada inserción, edición y eliminación de familiares genera un registro con fecha e IP en `AuditLog`.

---

## 5. Solución de Problemas Comunes (Troubleshooting)

| Síntoma | Posible Causa | Solución Rápida |
| :--- | :--- | :--- |
| **Pantalla en blanco o carga lenta en Chrome/Safari móvil.** | El navegador estaba cargando módulos sueltos de desarrollo. | Ejecute `npm run build` y sirva con `npx vite preview`. Luego recargue la página en el celular. |
| **Error "No hay suscripción push registrada para enviar la prueba".** | No se ha pulsado el botón de permitir notificaciones en el navegador. | Ingrese a la campana 🔔, pulse "Activar Notificaciones" y acepte el diálogo emergente del sistema. |
| **Puerto 8443 o 5000 ya está en uso.** | Un proceso anterior de Node.js quedó en segundo plano. | En PowerShell ejecute: `Stop-Process -Name "node" -Force` y vuelva a iniciar. |
| **La sesión se cierra al apagar el celular.** | Modo incógnito o cookies desactivadas. | Abra la aplicación en navegación normal o instálela como PWA en la pantalla de inicio; el sistema almacena la sesión de forma persistente. |

---
*Documento oficial elaborado para sustentación y entrega de Ingeniería de Software II — Fundación Escuela Tecnológica de Neiva (FET).*

