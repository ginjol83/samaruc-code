# 🐛 Debugging SamaruC Code - Resumen Rápido

## ✅ CONFIGURACIÓN COMPLETADA

Tu proyecto ahora tiene debugging completo configurado para VS Code y Electron.

## 🚀 OPCIONES DE DEBUGGING

### 1. **VS Code Debug Panel** (Recomendado)
- Abre VS Code en el proyecto
- Ve a **Run and Debug** (Ctrl+Shift+D)
- Selecciona configuración:
  - `Debug Main Process` - Main.js debugging
  - `Debug Renderer Process` - Frontend debugging  
  - `Debug Both` - Ambos procesos
  - `Debug Full App` - Configuración completa

### 2. **Scripts NPM**
```bash
npm run debug          # Básico con DevTools
npm run debug-main     # Main process (puerto 9229)
npm run debug-renderer # Renderer (puerto 9222)
npm run debug-full     # Completo (ambos puertos)
```

### 3. **Helper de Debug**
```bash
npm run debug-helper           # Muestra opciones
npm run debug-helper basic     # Debug básico
npm run debug-helper main      # Main process
npm run debug-helper renderer  # Renderer process
npm run debug-helper full      # Completo
```

### 4. **Tareas de VS Code** 
- **Ctrl+Shift+P** → "Tasks: Run Task"
- Opciones disponibles:
  - Start Debug Mode
  - Kill Electron Processes  
  - Restart Debug

## 🔧 ARCHIVOS CREADOS

- `.vscode/launch.json` - Configuraciones de debug
- `.vscode/tasks.json` - Tareas de VS Code
- `.vscode/settings.json` - Configuración del workspace
- `.vscode/extensions.json` - Extensiones recomendadas
- `debug-helper.js` - Utilidad de debugging
- `DEBUG-GUIDE.md` - Guía completa de debugging

## 💡 DEBUGGING RÁPIDO

### Para debuggear Monaco Editor:
1. **F12** en la app → Console
2. Escribe: `window.monaco`, `monacoInstance`, `openFiles`
3. Coloca `debugger;` en funciones como `loadMonacoEditor()`

### Para debuggear sistema de pestañas:
1. Breakpoints en `createTab()`, `switchToTab()`, `closeTab()`
2. Ver variables: `activeFile`, `openFiles`, `fileCounter`

### Para debuggear archivos:
1. Breakpoints en `fileManager.js`
2. Ver calls: `openFile()`, `saveFile()`, IPC handlers

## 🎯 NEXT STEPS

1. **Inicia debugging**: `npm run debug` o usa VS Code
2. **Coloca breakpoints** donde necesites
3. **Usa DevTools** para inspeccionar Monaco
4. **Lee DEBUG-GUIDE.md** para detalles completos

## 🐟 ¡Happy Debugging!

Tu SamaruC Code ahora está listo para debugging profesional. 
¡Que el código fluya como el samaruc en las aguas! 🌊✨
