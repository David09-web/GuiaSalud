# Aplicación Web Frontend - GuiaSalud Versión 1.0

Este módulo corresponde a la aplicación web SPA / PWA de **GuiaSalud v1.0**, construida con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS v4**.

---

## 👤 Responsable Técnico
- **Juan Camilo Ramírez** (*Frontend Lead*)
- **Asignatura:** Ingeniería de Software II - FET Neiva
- **Docente Gestor:** Miguel Antonio Urbano Silva

---

## 🛠️ Stack Tecnológico

- **Biblioteca UI:** React 19 (Hooks, Context, JSX)
- **Lenguaje:** TypeScript 5.7+
- **Empaquetador y Dev Server:** Vite 8 con `@vitejs/plugin-react`
- **Estilos:** Tailwind CSS v4 con `@tailwindcss/vite`
- **Iconografía:** `lucide-react`
- **Formateo y Calidad de Código:** `oxfmt`

---

## 📂 Estructura del Código Web

```
src/
├── components/          # Componentes reutilizables
│   ├── BottomNav.tsx    # Barra de navegación inferior
│   ├── FileViewerModal.tsx # Visor de exámenes clínicos seguros
│   └── Header.tsx       # Encabezado con perfil y alertas
├── screens/             # Vistas de la aplicación
│   ├── AdminScreen.tsx  # Panel de gestión de tutoriales y logs OMS
│   ├── AgendaScreen.tsx # Calendario y gestión de citas médicas
│   ├── ClinicalHistoryScreen.tsx # Historia clínica y exportación PDF
│   ├── HomeScreen.tsx   # Dashboard principal del paciente
│   ├── LoginScreen.tsx  # Login con verificación 2FA y selector de rol
│   ├── MedicationsScreen.tsx # Adherencia y control de medicamentos
│   ├── ProfileScreen.tsx # Perfil, cuidadores y Habeas Data
│   └── TutorialsScreen.tsx # Guías paso a paso del SGSSS
├── data.ts              # Datos mock iniciales y persistencia local
├── types.ts             # Definición de tipos de datos
├── index.css            # Import de Tailwind CSS v4 y temas
├── App.tsx              # Componente raíz con orquestación de pantallas y roles
└── main.tsx             # Punto de entrada de React en el DOM
```

---

## 🚀 Ejecución en Modo Desarrollo

### 1. Instalación de Dependencias
En la raíz del proyecto:
```bash
npm install
```

### 2. Iniciar el Servidor Vite
```bash
npm run dev
```

La aplicación estará disponible de inmediato en `http://localhost:8443` (o el puerto asignado por Vite).

### 3. Compilación para Producción
```bash
npm run build
```
Los artefactos optimizados se generarán en la carpeta `dist/`.
