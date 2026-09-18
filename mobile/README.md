# Aplicación Móvil - GuiaSalud Versión 1.0

Este directorio contiene la aplicación móvil oficial de **GuiaSalud v1.0**, desarrollada con **React Native**, **Expo** y **TypeScript**, optimizada para dispositivos Android e iOS.

---

## 👤 Responsable Técnico
- **Juan Camilo Ramírez** (*Frontend & Mobile Lead*)
- **Asignatura:** Ingeniería de Software II - FET Neiva
- **Docente Gestor:** Miguel Antonio Urbano Silva

---

## 🛠️ Stack Tecnológico

- **Framework:** React Native + Expo (SDK 52)
- **Lenguaje:** TypeScript 5.3+
- **Navegación:** `@react-navigation/native` + `@react-navigation/native-stack` + `@react-navigation/bottom-tabs`
- **Iconos:** `lucide-react-native` + `react-native-svg`
- **Almacenamiento Seguro:** `expo-secure-store`
- **Integración Backend:** Conexión REST a API Node.js / Express con JWT y 2FA

---

## 📂 Estructura del Proyecto

```
mobile/
├── src/
│   ├── navigation/        # Enrutamiento Stack y Pestañas
│   │   └── AppNavigator.tsx
│   ├── screens/           # Pantallas principales
│   │   ├── AgendaScreen.tsx
│   │   ├── ClinicalHistoryScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MedicationsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/          # Cliente API y almacenamiento
│   │   └── api.ts
│   ├── theme/             # Tokens de diseño y colores
│   │   └── colors.ts
│   └── types/             # Tipado TypeScript
│       └── index.ts
├── App.tsx                # Entrada de la aplicación y Providers
├── app.json               # Configuración Expo y manifiesto Android/iOS
├── package.json           # Dependencias y scripts de Expo
├── tsconfig.json          # Configuración de compilación TypeScript
└── README.md
```

---

## 📱 Ejecución en Entorno Local

### 1. Requisitos Previos
- Node.js (v18 o v20 LTS)
- Dispositivo móvil con la app **Expo Go** instalada (Google Play Store o Apple App Store) o Emulador Android Studio / Simulador Xcode.

### 2. Instalación de Dependencias
```bash
cd mobile
npm install
```

### 3. Iniciar el Servidor de Desarrollo Expo
```bash
npm start
```
o con Expo CLI directo:
```bash
npx expo start
```

### 4. Probar en Dispositivo Físico o Emuladores
- **Dispositivo Físico:** Escanea el código QR que aparece en la consola con la cámara (iOS) o la app Expo Go (Android).
- **Emulador Android:** Presiona la tecla `a` en la terminal.
- **Simulador iOS:** Presiona la tecla `i` en la terminal (requiere macOS).
- **Navegador Web:** Presiona la tecla `w` en la terminal.
