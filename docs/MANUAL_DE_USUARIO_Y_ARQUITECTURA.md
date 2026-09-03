# Manual de Usuario y Arquitectura Técnica - GuiaSalud Versión 1.0

**Proyecto:** GuiaSalud Versión 1.0  
**Asignatura:** Ingeniería de Software II - FET Neiva  
**Docente Gestor:** Miguel Antonio Urbano Silva  
**Equipo de Desarrollo:** David Marcet Ospina, Juan Camilo Ramírez, Francisco Trujillo Peralta  

---

## 1. Visión General y Arquitectura del Sistema

GuiaSalud es una plataforma integral diseñada para solucionar la dispersión en los trámites de salud, la falta de adherencia farmacológica y la fragmentación de la historia clínica personal en Colombia.

```
+---------------------------------------------------------------+
|                      CAPA DE PRESENTACIÓN                     |
|           React 19 + TypeScript + Tailwind CSS v4             |
|   [ Paciente (MR) ]   [ Familiar Cuidador ]   [ Admin FET ]  |
+-------------------------------+-------------------------------+
                                | (HTTPS / REST API + JWT 2FA)
+-------------------------------v-------------------------------+
|                        CAPA DE SERVICIOS                      |
|                  Node.js / Express / TypeScript               |
|  - Módulo 1: Agenda Médica & Estados                          |
|  - Módulo 2: Medicamentos & Adherencia                        |
|  - Módulo 3: Historia Clínica Cifrada (AES-256)               |
|  - Módulo 4: Perfil, Familiar Cuidador & Habeas Data          |
|  - Módulo 5: Tutoriales SGSSS & Enlaces Verificados           |
|  - Motor de Notificaciones Multicanal                         |
|  - Auditoría de Seguridad & Logs OMS                          |
+-------------------------------+-------------------------------+
                                | (PostgreSQL Client / SSL)
+-------------------------------v-------------------------------+
|                       CAPA DE PERSISTENCIA                    |
|                        PostgreSQL 15+                         |
|   [ Tablas Relacionales ]  [ RBAC ]  [ Bóveda de Archivos ]   |
+---------------------------------------------------------------+
```

---

## 2. Guía de Uso por Roles

### A. Rol Paciente (Usuario Principal)
1. **Inicio:** Visualiza saludo personalizado, resumen de citas de la semana, medicinas del día y accesos rápidos.
2. **Agenda Médica:**
   - Consulta citas organizadas por fecha en la tira de calendario.
   - Filtra por estado (`Todas`, `Pendiente`, `Realizada`, `Cancelada`) o especialidad.
   - Presiona **"Nueva Cita"** para registrar citas con IPS y médicos.
   - Configura recordatorios o marca citas como realizadas/canceladas.
3. **Control de Medicamentos:**
   - Revisa tratamientos activos, calcula el avance y atiende alertas de **fin de tratamiento próximo**.
   - Marca las tomas del día como `✓ Tomada` o `✗ Omitida` para alimentar el historial de adherencia.
   - Agrega nuevas fórmulas médicas con el botón **"Nueva Receta"**.
4. **Historia Clínica Personal:**
   - Consulta tipo de sangre, alergias y diagnósticos crónicos (CIE-10).
   - Accede a la bóveda de exámenes diagnósticos (Laboratorios, Rayos X, Ecografías) mediante el visor seguro.
   - Presiona **"Exportar PDF"** para generar el Resumen Clínico Consolidado listo para imprimir.
5. **Perfil & Familiar Autorizado:**
   - Actualiza datos personales y EPS/IPS.
   - Gestiona cuidadores autorizados con permisos granulares (citas, medicamentos, alertas).
   - Utiliza el botón de llamada de emergencia rápida.
   - Ejerce derechos de Habeas Data (descarga de datos o revocación de consentimientos).

### B. Rol Familiar Autorizado (Cuidador)
1. Accede con credenciales autorizadas con selector de rol en pantalla de Login o en la barra superior.
2. Visualiza el banner de acompañamiento: *"Modo Familiar Autorizado: Cuidando a María Rodríguez"*.
3. Monitorea la agenda médica, medicamentos y alertas del paciente dependiente según los permisos otorgados.

### C. Rol Administrador (Gestión & Auditoría)
1. Accede al **Panel de Administrador** desde la barra de navegación.
2. Gestiona el catálogo de tutoriales de trámites, redacta nuevos pasos y actualiza las URLs oficiales verificadas.
3. Supervisa el monitor de eventos de ciberseguridad y logs de auditoría según los estándares de la OMS.
4. Administra cuentas de usuario respetando la política de privacidad estricta (sin acceso a datos médicos privados).
