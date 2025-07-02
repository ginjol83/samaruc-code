# 🐛 Debugging SamaruC Code en VS Code

Esta guía explica cómo debuggear la aplicación Electron SamaruC Code usando VS Code.

## 🚀 Configuraciones de Debug Disponibles

### 1. **Debug Main Process** 
- Debuggea el proceso principal de Electron (main.js)
- Útil para debuggear lógica de ventanas, menús, IPC handlers
- Breakpoints en archivos de Node.js/Electron

### 2. **Debug Renderer Process**
- Debuggea el proceso renderer (src/index.html, scripts del frontend)
- Útil para debuggear lógica del editor, Monaco, interfaz
- Breakpoints en archivos JavaScript del frontend

### 3. **Debug Both (Main + Renderer)**
- Debuggea ambos procesos simultáneamente
- Configuración más completa para debugging completo

### 4. **Debug Full App** (Compound)
- Ejecuta automáticamente ambas configuraciones
- Recomendado para debugging completo

## 🎯 Cómo Usar

### Método 1: Panel de Debug de VS Code
1. Abre VS Code en la carpeta del proyecto
2. Ve al panel de **Run and Debug** (Ctrl+Shift+D)
3. Selecciona la configuración deseada del dropdown
4. Presiona **F5** o el botón de play verde

### Método 2: Scripts NPM
```bash
# Modo debug básico (DevTools abierto)
npm run debug

# Debug del main process (puerto 9229)
npm run debug-main

# Debug del renderer process (puerto 9222)
npm run debug-renderer

# Debug completo (ambos puertos)
npm run debug-full
```

### Método 3: Tareas de VS Code
1. **Ctrl+Shift+P** → "Tasks: Run Task"
2. Selecciona:
   - "Start Debug Mode" - Inicia en modo debug
   - "Kill Electron Processes" - Mata procesos colgados
   - "Restart Debug" - Reinicia debugging

## 🔧 Breakpoints y Debugging

### Main Process (main.js)
- Coloca breakpoints directamente en `main.js`
- Debuggea handlers IPC, creación de ventanas, menús
- Variables disponibles: `mainWindow`, `app`, etc.

### Renderer Process (frontend)
- Coloca breakpoints en `src/index.html` (script tags)
- Debuggea funciones como `createTab`, `loadMonacoEditor`
- Variables disponibles: `monacoInstance`, `openFiles`, etc.

### Debugging de Monaco Editor
```javascript
// Ejemplo de debugging en Monaco
function createMonacoEditor() {
    debugger; // Breakpoint aquí
    try {
        const container = document.getElementById('monaco-editor');
        // ... resto del código
    } catch (error) {
        debugger; // Y aquí para errores
        console.error('Error:', error);
    }
}
```

## 🛠️ Herramientas de Debug

### DevTools de Chrome
- Se abren automáticamente en modo debug
- **Console**: Ver logs y ejecutar código
- **Sources**: Navegar código y breakpoints
- **Network**: Ver requests (para recursos Monaco)
- **Application**: LocalStorage, SessionStorage

### VS Code Debugger
- **Variables**: Ver estado de variables
- **Call Stack**: Rastrear llamadas de funciones
- **Watch**: Monitorear expresiones específicas
- **Debug Console**: Evaluar expresiones

## 🎨 Debugging de Monaco Editor

### Verificar Carga de Monaco
```javascript
// En Debug Console
window.monaco // Debe retornar objeto
window.monacoInstance // Debe retornar instancia del editor
```

### Debugging de Pestañas
```javascript
// Ver archivos abiertos
openFiles

// Ver archivo activo
activeFile

// Ver contenido de pestaña específica
openFiles.get('temp://nuevo1.c')
```

### Debugging de Contenido
```javascript
// Obtener contenido actual
getEditorContent()

// Verificar si Monaco está activo
!!monacoInstance

// Ver modelos de Monaco
monacoInstance?.getModel()
```

## 🚨 Solución de Problemas

### Electron no inicia en debug
```bash
# Matar procesos colgados
npm run tasks:kill-electron
# O manualmente:
taskkill /F /IM electron.exe
```

### Puerto ocupado
- Cambia puertos en `.vscode/launch.json`
- Verifica que no hay otras instancias corriendo

### Breakpoints no funcionan
- Asegúrate de que `sourceMap` esté habilitado
- Verifica que el archivo está siendo ejecutado
- Usa `debugger;` como alternativa

### Monaco no carga en debug
- Revisa Console de DevTools
- Verifica rutas en Network tab
- Asegúrate que archivos Monaco existen en `src/monaco/`

## 📊 Debugging de Performance

### Para analizar rendimiento de Monaco:
1. **Performance tab** en DevTools
2. Graba mientras cargas Monaco
3. Analiza tiempos de carga de recursos

### Memory Leaks:
1. **Memory tab** en DevTools
2. Toma snapshots antes/después de crear pestañas
3. Compara uso de memoria

## 🎪 Tips de Debugging

1. **Usa console.log estratégicamente**:
   ```javascript
   console.log('🐛 Monaco loading...', { basePath, window: !!window.monaco });
   ```

2. **Breakpoints condicionales**:
   - Click derecho en breakpoint → "Edit breakpoint"
   - Agregar condición: `fileName.includes('.c')`

3. **Logpoints** (no para en breakpoint):
   - Click derecho → "Add Logpoint"
   - Mensaje: `"Tab created: {fileName}"`

4. **Step debugging**:
   - **F10**: Step over
   - **F11**: Step into
   - **Shift+F11**: Step out

¡Debugging exitoso! 🐟✨
