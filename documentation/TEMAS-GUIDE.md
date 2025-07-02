# 🎨 Guía de Temas en SamaruC Code

## ✨ Características de Tema

SamaruC Code incluye soporte completo para temas oscuros y claros, incluyendo:

- **Menú nativo oscuro** en Windows/Linux/macOS
- **Tema automático** que sigue el sistema operativo
- **Alternancia manual** de temas
- **Monaco Editor** sincronizado con el tema
- **Transiciones suaves** entre temas

## 🎯 Cómo Cambiar Temas

### Método 1: Atajo de Teclado
- **Ctrl+Shift+T** (Windows/Linux)
- **Cmd+Shift+T** (macOS)

### Método 2: Menú
1. **Ver** → **Alternar Tema**
2. Cambia entre oscuro/claro

### Método 3: Seguir Sistema
El tema se sincroniza automáticamente con el tema del sistema operativo.

## 🔧 Configuración Técnica

### Tema Nativo de Electron
```javascript
// En main.js
nativeTheme.themeSource = 'dark'; // 'dark', 'light', 'system'
```

### Variables CSS
```css
:root {
    --bg-primary: #1e1e1e;    /* Fondo principal */
    --bg-secondary: #2d2d30;  /* Barra de herramientas */
    --text-primary: #d4d4d4;  /* Texto principal */
    --accent-blue: #0e639c;   /* Botones */
}
```

### Monaco Editor
```javascript
// Cambia automáticamente con el tema
monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
```

## 🎨 Personalización

### Agregar Nuevo Tema
1. **Definir variables en `styles.css`**:
```css
[data-theme="custom"] {
    --bg-primary: #your-color;
    --text-primary: #your-text;
}
```

2. **Aplicar en JavaScript**:
```javascript
document.documentElement.setAttribute('data-theme', 'custom');
```

### Colores del Sistema
- **Windows**: Respeta configuración de Apps oscuras/claras
- **macOS**: Sincroniza con modo oscuro de macOS
- **Linux**: Detecta tema GTK automáticamente

## 🚀 Funcionalidades Avanzadas

### Detección Automática
```javascript
// Escucha cambios del sistema
nativeTheme.on('updated', () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    applyTheme(isDark ? 'dark' : 'light');
});
```

### Sincronización IPC
```javascript
// Main process notifica al renderer
mainWindow.webContents.send('theme-changed', theme);

// Renderer process aplica el tema
ipcRenderer.on('theme-changed', (event, theme) => {
    applyTheme(theme);
});
```

### Estados de Tema
- **`dark`**: Fuerza tema oscuro
- **`light`**: Fuerza tema claro
- **`system`**: Sigue al sistema operativo

## 🎪 Debugging de Temas

### Console Logs
```javascript
console.log(`🎨 Tema actual: ${nativeTheme.themeSource}`);
console.log(`🖥️ Sistema usa oscuro: ${nativeTheme.shouldUseDarkColors}`);
```

### DevTools
1. **F12** para abrir DevTools
2. **Console** tab para ver logs de tema
3. **Elements** tab para inspeccionar CSS variables

### Test Manual
```javascript
// En DevTools Console
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.setAttribute('data-theme', 'dark');
```

## 🔍 Solución de Problemas

### Menú no es oscuro
- **Windows**: Actualizar a Windows 10 v1903+
- **Linux**: Instalar tema GTK oscuro
- **macOS**: Funciona automáticamente

### Monaco no cambia tema
```javascript
// Verificar en DevTools Console
window.monaco?.editor.setTheme('vs-dark');
```

### Variables CSS no aplican
```css
/* Verificar en DevTools Elements */
:root {
    --bg-primary: #1e1e1e !important;
}
```

## 🎨 Paleta de Colores

### Tema Oscuro (por defecto)
- **Primario**: `#1e1e1e` - Fondo principal
- **Secundario**: `#2d2d30` - Barra herramientas
- **Terciario**: `#3e3e42` - Bordes
- **Texto**: `#d4d4d4` - Texto principal
- **Acento Azul**: `#0e639c` - Botones primarios
- **Acento Verde**: `#16825d` - Éxito
- **Acento Naranja**: `#ca5010` - Advertencia
- **Acento Rojo**: `#c5282f` - Error

### Tema Claro (opcional)
- **Primario**: `#ffffff` - Fondo principal
- **Secundario**: `#f3f3f3` - Barra herramientas
- **Texto**: `#333333` - Texto principal
- **Acento Azul**: `#0078d4` - Botones primarios

¡El samaruc nada mejor en aguas oscuras! 🐟✨
