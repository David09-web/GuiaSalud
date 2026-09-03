# Plan Maestro de Pruebas, Matriz de Riesgos y Estándares OMS

**Proyecto:** GuiaSalud Versión 1.0  
**Asignatura:** Ingeniería de Software II  
**Institución:** Fundación Escuela Tecnológica de Neiva (FET)  
**Encargado Seguimiento (Tracker) y Tester:** Francisco Trujillo Peralta  
**Líder Frontend y Auditor:** Juan Camilo Ramírez  
**Líder Backend:** David Marcet Ospina  
**Docente Gestor:** Miguel Antonio Urbano Silva  

---

## 1. Alcance y Estrategia de Calidad (QA)

El presente documento formaliza el aseguramiento de la calidad de software y la gestión de riesgos para **GuiaSalud Versión 1.0**, garantizando el cumplimiento de los **Objetivos de Desarrollo Sostenible (ODS 16 y ODS 3)**, la **Ley 1581 de 2012 (Habeas Data)** y las **Directrices de Ciberseguridad en Salud Digital de la OMS**.

---

## 2. Matriz de Casos de Prueba Funcionales

| ID Caso | Módulo | Caso de Prueba | Criterio de Aceptación | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **CP-001** | Autenticación | Login con Doble Factor (2FA). | El sistema solicita y valida token de 6 dígitos antes de expedir acceso. | **EXITOSO** |
| **CP-002** | Roles / RBAC | Restricción de acceso para Administrador. | El rol `ADMIN` no puede visualizar historias clínicas privadas. | **EXITOSO** |
| **CP-003** | Módulo 1 (Agenda) | Agendar nueva cita médica. | La cita se agrega en estado `Pendiente` y se refleja en el inicio y calendario. | **EXITOSO** |
| **CP-004** | Módulo 1 (Agenda) | Actualizar estado a `Realizada` o `Cancelada`. | El estado y color del indicador se actualizan de inmediato en la lista. | **EXITOSO** |
| **CP-005** | Módulo 2 (Medicamentos) | Marcar toma diaria (`Realizada` / `Omitida`). | El estado del día cambia y se agrega un registro en el historial de dosis. | **EXITOSO** |
| **CP-006** | Módulo 2 (Medicamentos) | Detección de fin de tratamiento. | Si el avance es $\ge 80\%$, se despliega la alerta de renovación de fórmula. | **EXITOSO** |
| **CP-007** | Módulo 3 (Historia) | Adjuntar documento médico y visualización. | El archivo se lista con insignia de cifrado AES-256 y abre el visor seguro. | **EXITOSO** |
| **CP-008** | Módulo 3 (Historia) | Exportación de Resumen Clínico en PDF. | Se genera el documento estructurado formal listo para imprimir o guardar. | **EXITOSO** |
| **CP-009** | Módulo 4 (Perfil) | Delegación a Familiar Cuidador. | El paciente configura permisos selectivos y el familiar solo accede a lo autorizado. | **EXITOSO** |
| **CP-010** | Módulo 4 (Habeas Data) | Revocación de consentimiento. | Se registra la fecha de revocación y se genera log de seguridad inmutable. | **EXITOSO** |
| **CP-011** | Módulo 5 (Tutoriales) | Consulta de guías paso a paso. | Se muestran los pasos del trámite y el enlace oficial verificado funciona. | **EXITOSO** |
| **CP-012** | Panel Admin | Creación y verificación de trámites. | El administrador publica una guía y valida su URL oficial ante entes del SGSSS. | **EXITOSO** |

---

## 3. Matriz de Riesgos del Proyecto y Mitigación

| ID Riesgo | Descripción del Riesgo | Nivel de Impacto | Probabilidad | Estrategia de Mitigación |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | Fuga de datos clínicos confidenciales. | **Crítico (Alto)** | Baja | Implementación de cifrado AES-256 en reposo, TLS 1.3 en tránsito y política de mínimo privilegio (RBAC). |
| **RSK-002** | Suplantación de identidad en acceso a cuenta. | **Alto** | Media | Obligatoriedad de Doble Factor de Autenticación (2FA) y bloqueo por intentos fallidos. |
| **RSK-003** | Abuso de privilegios por parte del rol Administrador. | **Alto** | Baja | Restricción arquitectónica en API que bloquea endpoints de historia clínica para administradores. |
| **RSK-004** | Enlaces gubernamentales rotos o desactualizados. | **Medio** | Media | Panel administrativo con verificación periódica de URLs oficiales y sellos de validación. |
| **RSK-005** | Incumplimiento de tomas de medicamentos por olvido. | **Medio** | Alta | Sistema multicanal de recordatorios interactivos, alertas de fin de tratamiento y modo familiar cuidador. |

---

## 4. Checklist de Auditoría de Ciberseguridad en Salud Digital (OMS)

- [x] **Cifrado de datos en reposo y en tránsito:** Algoritmos estándar robustos (AES-256-GCM y HTTPS).
- [x] **Doble Factor de Autenticación (2FA):** Implementado en el flujo de inicio de sesión.
- [x] **Trazabilidad Inmutable (Audit Logs):** Registro de fecha, usuario, rol, IP, módulo y acción realizada.
- [x] **Gestión de Consentimientos (Habeas Data):** Opciones claras para revocar, descargar o rectificar datos personales.
- [x] **Anonimización Académica:** Todos los datos cargados en el prototipo son estrictamente ficticios con fines didácticos.
- [x] **Diseño Responsivo Accesible:** Interfaz adaptable a dispositivos móviles y escritorio con alto contraste y tipografía clara.
