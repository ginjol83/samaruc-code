# 🎮 Retro Game IDE - Versión Vue.js + Electron

## 🚀 Migración Completada a Vue.js

¡Hemos migrado exitosamente el IDE a Vue.js manteniendo Electron! Ahora tienes una aplicación más moderna, mantenible y escalable.

## 🌟 Nuevas Características con Vue.js

### ✅ Ventajas de la Migración:

1. **Mejor Organización**: Componentes modulares y reutilizables
2. **Estado Centralizado**: Vuex para manejo del estado de la aplicación
3. **Reactividad**: Actualizaciones automáticas de la interfaz
4. **Mejor Performance**: Virtual DOM de Vue.js
5. **Hot Reload**: Desarrollo más rápido con recarga automática
6. **TypeScript Ready**: Preparado para migrar a TypeScript

### 🏗️ Arquitectura de la Aplicación

```
src-vue/
├── main.js              # Punto de entrada de Vue
├── main-electron.js     # Proceso principal de Electron
├── App.vue              # Componente raíz
├── components/
│   ├── Toolbar.vue      # Barra de herramientas
│   ├── Sidebar.vue      # Explorador de archivos
│   ├── MonacoEditor.vue # Editor de código
│   ├── EditorTabs.vue   # Pestañas de archivos
│   ├── WelcomeScreen.vue# Pantalla de bienvenida
│   └── BottomPanel.vue  # Panel de salida/terminal
└── stores/
    └── index.js         # Store de Vuex
```

## 🛠️ Instalación y Configuración

### 1. Configuración Inicial
```bash
setup-vue.bat
```

### 2. Iniciar en Modo Desarrollo
```bash
start-vue.bat
# O directamente:
npm run dev
```

### 3. Construir para Producción
```bash
npm run electron:build
```

## 🔧 Capacidades de Gestión de Archivos

**¡SÍ, mantiene TODAS las capacidades de gestión de archivos locales!**

### ✅ Funcionalidades Mantenidas:

- **Lectura/Escritura de archivos locales**
- **Exploración de directorios**
- **Compilación con GCC**
- **Ejecución de programas**
- **Creación de proyectos**
- **Gestión de plantillas**

### 🔄 Comunicación Electron-Vue:

```javascript
// En Vue (renderer process)
const { ipcRenderer } = require('electron');

// Leer archivo
const result = await ipcRenderer.invoke('read-file', filePath);

// Escribir archivo
await ipcRenderer.invoke('write-file', filePath, content);

// Compilar proyecto
await ipcRenderer.invoke('compile-project', projectPath, mainFile);
```

## 🎯 Componentes Vue Principales

### 1. **Toolbar.vue**
- Botones de acción (nuevo, abrir, guardar, compilar)
- Selector de plantillas
- Eventos reactivos

### 2. **MonacoEditor.vue**
- Integración completa con Monaco Editor
- Soporte para múltiples lenguajes
- Autocompletado y resaltado de sintaxis

### 3. **Sidebar.vue**
- Explorador de archivos reactivo
- Navegación por directorios
- Detección automática de cambios

### 4. **BottomPanel.vue**
- Panel de salida con colores
- Terminal integrada
- Lista de problemas de compilación

## 📊 Estado de la Aplicación con Vuex

```javascript
// Store centralizado
const store = {
  state: {
    currentProject: null,
    openFiles: new Map(),
    activeFile: null,
    editor: null,
    outputLines: [],
    problems: []
  },
  mutations: {
    SET_ACTIVE_FILE,
    ADD_OUTPUT_LINE,
    UPDATE_FILE_CONTENT
  },
  actions: {
    compileProject,
    saveCurrentFile,
    loadTemplate
  }
}
```

## 🎮 Ejemplos de Uso

### Abrir un Proyecto
```javascript
// En cualquier componente Vue
this.$store.dispatch('openProject', projectPath);
```

### Compilar Código
```javascript
// Compilación reactiva
await this.$store.dispatch('compileProject');
```

### Cargar Plantilla
```javascript
// Las plantillas están en el store
this.$store.dispatch('loadTemplate', 'basic-game');
```

## 🚀 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con hot reload |
| `npm run serve` | Solo servidor Vue |
| `npm run build` | Build de producción |
| `npm run electron:serve` | Electron + Vue dev |
| `npm run electron:build` | Build final de Electron |

## 🔄 Diferencias con la Versión Original

### ✅ Mejoras:
- **Componentes modulares** en lugar de funciones globales
- **Estado reactivo** en lugar de variables globales
- **Hot reload** para desarrollo más rápido
- **Mejor organización** del código
- **Escalabilidad** mejorada

### ✅ Mantenido:
- **Todas las funcionalidades** del IDE original
- **Misma interfaz visual**
- **Mismos atajos de teclado**
- **Compatibilidad con GCC**
- **Gestión de archivos locales**

## 🛠️ Personalización

### Agregar Nuevos Componentes:
```javascript
// Crear nuevo componente
// components/MiComponente.vue
<template>
  <div>Mi componente personalizado</div>
</template>

<script>
export default {
  name: 'MiComponente'
}
</script>
```

### Extender el Store:
```javascript
// Agregar nueva funcionalidad al store
mutations: {
  MI_NUEVA_MUTACION(state, payload) {
    // Lógica aquí
  }
}
```

## 🐛 Solución de Problemas Vue

### Error: "Vue CLI no encontrado"
```bash
npm install -g @vue/cli
```

### Error: "Module not found"
```bash
npm install
# O específicamente:
npm run setup-vue
```

### Hot Reload no funciona
- Verificar que el servidor esté en puerto 8080
- Reiniciar con `npm run dev`

## 📈 Próximos Pasos Sugeridos

1. **TypeScript**: Migrar a TypeScript para mejor tipado
2. **Plugins Vue**: Agregar plugins específicos
3. **Testing**: Implementar tests unitarios
4. **PWA**: Capacidades de Progressive Web App
5. **Temas**: Sistema de temas personalizable

## 🎉 ¡Migración Exitosa!

Tu IDE ahora utiliza Vue.js + Electron, manteniendo todas las capacidades de gestión de archivos locales pero con una arquitectura moderna y escalable.

**Para empezar:**
1. Ejecuta `setup-vue.bat`
2. Luego `start-vue.bat`
3. ¡Disfruta tu IDE modernizado!

🚀 **¡El futuro del desarrollo de juegos retro está aquí!** 🎮
