# Cómo Probar la Funcionalidad de Abrir Archivos

## Problema Identificado
La funcionalidad de abrir archivos no funciona correctamente. He añadido logs de depuración para identificar el problema.

## Verificaciones Realizadas

### ✅ Handlers IPC en main.js
- `show-open-dialog`: ✅ Implementado
- `show-save-dialog`: ✅ Implementado  
- `read-file`: ✅ Implementado
- `write-file`: ✅ Implementado
- `update-window-title`: ✅ Implementado

### ✅ Función openFile() en renderer.js
- Event listener conectado correctamente
- Logs de depuración añadidos
- Manejo de errores mejorado
- Fallback para navegador implementado

### ✅ Función openFileInEditor() en renderer.js
- Validaciones de parámetros
- Logs de depuración añadidos
- Detección de tipos de archivo
- Manejo de archivos grandes y binarios

### ✅ Funciones auxiliares
- `createTab()`: ✅ Existe
- `switchToFile()`: ✅ Existe
- `updateWindowTitle()`: ✅ Implementada
- `formatFileSize()`: ✅ Implementada
- `isBinaryFile()`: ✅ Implementada
- `addToRecentFiles()`: ✅ Implementada

## Pasos para Probar

### 1. Iniciar la aplicación
```bash
cd c:\Users\MTCAGM\Documents\idetest
npm start
```

### 2. Abrir la consola de desarrollador (F12)
Para ver los logs de depuración que he añadido.

### 3. Probar el botón "Abrir Archivo"
- Click en el botón de abrir archivo en la barra de herramientas
- Debería aparecer un diálogo nativo de Windows
- Seleccionar el archivo `test-file.c` que creé

### 4. Verificar en la consola
Los siguientes logs deberían aparecer:
```
Configurando event listeners...
Elementos encontrados: {openFileBtn: true, ...}
Botón de abrir archivo clickeado
openFile() llamada
Usando API de Electron
Resultado del diálogo: {...}
Contenido del archivo recibido: {...}
openFileInEditor llamada con: {...}
Detectado: {fileExtension: '.c', language: 'c'}
Archivo añadido a openFiles: test-file.c
```

### 5. Probar métodos alternativos
Si el botón no funciona:
- Probar Ctrl+O (atajo de teclado)
- Probar drag & drop del archivo desde Windows Explorer

## Posibles Problemas

### A. Event Listener no se conecta
**Síntoma**: No aparece "Botón de abrir archivo clickeado" en consola
**Causa**: El elemento no existe cuando se asigna el event listener
**Solución**: Verificar timing de inicialización

### B. IPC no funciona
**Síntoma**: Error "ipcRenderer.invoke is not a function"
**Causa**: Electron no está disponible o mal configurado
**Solución**: Verificar configuración de Electron en main.js

### C. Diálogo no aparece
**Síntoma**: "openFile() llamada" aparece pero no hay diálogo
**Causa**: Handler IPC 'show-open-dialog' no responde
**Solución**: Verificar implementación en main.js

### D. Archivo no se lee
**Síntoma**: Diálogo aparece pero archivo no se abre
**Causa**: Handler IPC 'read-file' falla
**Solución**: Verificar permisos de archivo y handler

### E. Editor no muestra contenido
**Síntoma**: Archivo se lee pero no aparece en editor
**Causa**: Monaco Editor no inicializado o createTab/switchToFile fallan
**Solución**: Verificar inicialización de Monaco

## Archivos de Prueba

He creado estos archivos para probar:
- `test-file.c`: Archivo C simple para abrir
- `test-open.bat`: Script para iniciar el IDE

## Debug Logs Añadidos

### En setupEventListeners():
- Verificación de existencia de elementos
- Confirmación de asignación de event listeners

### En openFile():
- Confirmación de llamada a función
- Resultado del diálogo de Electron
- Contenido del archivo recibido
- Manejo de errores detallado

### En openFileInEditor():
- Parámetros recibidos
- Validaciones realizadas
- Detección de lenguaje
- Creación de pestaña

## Próximos Pasos

1. **Ejecutar el IDE y abrir la consola de desarrollador**
2. **Intentar abrir un archivo y observar los logs**
3. **Identificar en qué paso falla el proceso**
4. **Corregir el problema específico identificado**

Una vez que identifiques dónde falla exactamente, puedo hacer los ajustes necesarios para solucionarlo.
