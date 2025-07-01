# Funcionalidades de Abrir Archivos - Retro Game IDE

## Resumen
Se ha implementado una funcionalidad completa y robusta para abrir archivos en el Retro Game IDE, con múltiples métodos de apertura, archivos recientes, drag-and-drop, y atajos de teclado.

## Características Implementadas

### 1. Métodos de Apertura de Archivos

#### A. Botón "Abrir Archivo" (Ctrl+O)
- **Ubicación**: Barra de herramientas principal
- **Funcionalidad**: Abre un diálogo para seleccionar archivos
- **Tipos soportados**:
  - Archivos C/C++ (.c, .h, .cpp, .hpp, .cc, .cxx, .c++, .hh, .hxx, .h++)
  - JavaScript/TypeScript (.js, .jsx, .ts, .tsx, .json)
  - Archivos Web (.html, .htm, .css, .scss, .sass, .less)
  - Python (.py, .pyx, .pyi)
  - Configuración (.json, .xml, .yaml, .yml, .toml, .ini, .cfg, .conf)
  - Scripts (.sh, .bash, .zsh, .fish, .ps1, .bat, .cmd)
  - Documentación (.md, .markdown, .txt, .log)
  - Construcción (.cmake, .makefile, .dockerfile)
  - Todos los archivos (*)

#### B. Archivos Recientes
- **Ubicación**: Botón con icono de historial junto al botón de abrir
- **Características**:
  - Guarda los últimos 10 archivos abiertos
  - Persistencia en localStorage
  - Atajos Ctrl+1 a Ctrl+9 para los primeros 9 archivos
  - Información de nombre de archivo y ruta completa
  - Eliminación automática de archivos que no existen

#### C. Drag & Drop
- **Funcionalidad**: Arrastrar archivos desde el explorador de Windows
- **Características**:
  - Indicador visual cuando se arrastra un archivo sobre el editor
  - Soporte para múltiples archivos
  - Apertura automática en nuevas pestañas

### 2. Detección de Tipos de Archivo

#### Lenguajes Soportados
El IDE detecta automáticamente el lenguaje basado en la extensión:

**Principales**:
- C/C++: `.c`, `.h`, `.cpp`, `.hpp`, `.cc`, `.cxx`, `.c++`, `.hh`, `.hxx`, `.h++`
- JavaScript: `.js`, `.jsx`, `.ts`, `.tsx`
- Web: `.html`, `.htm`, `.css`, `.scss`, `.sass`, `.less`
- Python: `.py`, `.pyx`, `.pyi`

**Adicionales**:
- Java, C#, PHP, Ruby, Go, Rust, Swift, Kotlin
- Shell scripts, PowerShell, Batch
- JSON, XML, YAML, TOML, INI
- Markdown, texto plano
- SQL, R, Objective-C

### 3. Validaciones y Seguridad

#### Validación de Archivos
- **Detección de archivos binarios**: Previene apertura accidental de archivos no-texto
- **Límite de tamaño**: Advertencia para archivos >2MB
- **Validación de encoding**: Manejo de diferentes codificaciones de texto
- **Manejo de errores**: Mensajes informativos para errores de lectura

#### Fallbacks
- **Sin Electron**: Utiliza input HTML5 file dialog
- **Sin Monaco**: Editor básico con textarea
- **Sin localStorage**: Funciona sin persistencia de archivos recientes

### 4. Experiencia de Usuario

#### Atajos de Teclado
- `Ctrl+O`: Abrir archivo
- `Ctrl+N`: Nuevo archivo
- `Ctrl+S`: Guardar archivo
- `Ctrl+Shift+S`: Guardar como
- `Ctrl+W`: Cerrar pestaña actual
- `Ctrl+Tab`: Cambiar a siguiente pestaña
- `Ctrl+1-9`: Abrir archivo reciente (1º-9º)
- `F5`: Compilar
- `F6`: Compilar y ejecutar

#### Tooltips
- Información contextual en todos los botones
- Indicación de atajos de teclado
- Ayuda visual para funcionalidades

#### Feedback Visual
- Mensajes en panel de salida para cada acción
- Indicadores de archivos modificados en pestañas
- Actualización automática del título de ventana
- Resaltado visual para drag-and-drop

### 5. Gestión de Pestañas

#### Funcionalidades
- **Pestañas dinámicas**: Creación automática al abrir archivos
- **Indicador de modificación**: Asterisco (*) en archivos modificados
- **Cierre de pestañas**: Botón X en cada pestaña
- **Cambio entre pestañas**: Click o atajos de teclado
- **Prevención de duplicados**: No abre el mismo archivo dos veces

### 6. Integración con Electron

#### IPC (Inter-Process Communication)
- **Diálogos nativos**: Utiliza diálogos del sistema operativo
- **Lectura de archivos**: Acceso seguro al sistema de archivos
- **Actualización de título**: Sincronización con ventana principal

#### Handlers Implementados
- `show-open-dialog`: Diálogo de apertura de archivos
- `show-save-dialog`: Diálogo de guardado de archivos
- `read-file`: Lectura segura de archivos
- `update-window-title`: Actualización del título de ventana

## Uso

### Abrir un Archivo
1. **Método 1**: Click en botón "Abrir Archivo" o `Ctrl+O`
2. **Método 2**: Click en botón de archivos recientes y seleccionar
3. **Método 3**: Arrastrar archivo desde explorador de Windows
4. **Método 4**: Usar atajo `Ctrl+1-9` para archivos recientes

### Trabajar con Múltiples Archivos
1. Abrir varios archivos usando cualquier método
2. Cambiar entre pestañas con click o `Ctrl+Tab`
3. Cerrar pestañas con botón X o `Ctrl+W`
4. Ver información del archivo actual en panel de salida

### Archivos Recientes
- Se actualizan automáticamente al abrir archivos
- Persisten entre sesiones del IDE
- Se pueden limpiar automáticamente si no existen
- Acceso rápido con atajos de teclado

## Casos de Uso Soportados

### Desarrollo de Juegos en C
- Apertura rápida de archivos .c y .h
- Navegación entre archivos fuente y headers
- Plantillas de juegos predefinidas

### Desarrollo Web
- Soporte completo para HTML, CSS, JavaScript
- Detección automática de lenguaje para resaltado
- Integración con herramientas de desarrollo

### Scripts y Configuración
- Archivos de configuración (JSON, YAML, etc.)
- Scripts de shell y batch
- Makefiles y dockerfiles

### Documentación
- Archivos Markdown con preview
- Archivos de texto plano
- Logs y archivos de depuración

## Arquitectura Técnica

### Componentes Principales
1. **openFile()**: Función principal de apertura
2. **openFileInEditor()**: Lógica de carga en editor
3. **getLanguageFromFile()**: Detección de lenguaje
4. **Recent files system**: Gestión de archivos recientes
5. **Drag & Drop handlers**: Manejo de archivos arrastrados

### Flujo de Datos
```
Usuario → Acción (click/shortcut/drag) → 
Validación → IPC/FileReader → 
Procesamiento → Editor Monaco → 
Pestaña + Archivos Recientes
```

### Manejo de Errores
- Validación en cada paso del proceso
- Fallbacks para diferentes entornos
- Mensajes informativos al usuario
- Logging para depuración

## Compatibilidad

### Entornos Soportados
- ✅ Electron (funcionalidad completa)
- ✅ Navegadores modernos (funcionalidad básica)
- ✅ Windows, macOS, Linux

### Dependencias
- Monaco Editor (opcional, con fallback)
- Electron APIs (opcional, con fallback)
- HTML5 File API (para fallback)
- localStorage (opcional)

## Conclusión

La funcionalidad de abrir archivos está completamente implementada con:
- Múltiples métodos de apertura
- Validación robusta y manejo de errores
- Experiencia de usuario intuitiva
- Compatibilidad multiplataforma
- Extensibilidad para futuros tipos de archivo

El sistema es robusto, fácil de usar y mantiene la funcionalidad core incluso sin todas las dependencias disponibles.
