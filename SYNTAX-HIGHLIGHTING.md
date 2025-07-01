# 🎨 Resaltado de Sintaxis en Samaruc Code

## Descripción
Samaruc Code ahora incluye **resaltado de sintaxis avanzado** para lenguaje C utilizando Monaco Editor, el mismo editor que usa Visual Studio Code.

## 🚀 Características Implementadas

### 1. **Resaltado de Sintaxis Mejorado**
- **Palabras clave**: `int`, `char`, `if`, `for`, `while`, `struct`, etc.
- **Tipos de datos**: Resaltado específico para tipos de C
- **Comentarios**: Tanto de línea (`//`) como de bloque (`/* */`)
- **Cadenas**: Strings y caracteres con escapes
- **Números**: Enteros, flotantes, hexadecimales
- **Preprocesador**: Directivas `#include`, `#define`, etc.
- **Operadores**: Todos los operadores de C
- **Funciones**: Identificación de llamadas a funciones

### 2. **Autocompletado Inteligente**
Monaco Editor incluye autocompletado para:
- **Funciones estándar**: `printf`, `scanf`, `malloc`, `free`, etc.
- **Headers comunes**: `stdio.h`, `stdlib.h`, `string.h`, etc.
- **Estructuras de control**: `if`, `for`, `while` con snippets
- **Plantillas de código**: Función `main`, estructuras, etc.

### 3. **Nuevas Plantillas de C**
Se han agregado plantillas específicas para desarrollo en C:

#### 📝 **Plantillas Disponibles:**
- **Programa Básico** (`c-basic`): Hello World simple
- **Con Argumentos** (`c-args`): Manejo de argumentos de línea de comandos
- **Con Estructuras** (`c-struct`): Ejemplo con typedef struct
- **Manejo de Archivos** (`c-fileio`): Lectura y escritura de archivos
- **Gestión de Memoria** (`c-memory`): malloc, free y manejo dinámico

### 4. **Tema Visual Mejorado**
- **Tema oscuro** personalizado "retro-dark"
- **Colores específicos** para cada tipo de token
- **Resaltado de llaves** y paréntesis emparejados
- **Números de línea** y minimap
- **Reglas visuales** a 80 y 120 caracteres

## 🔧 Configuración Técnica

### Editor Monaco
```javascript
// Configuración del editor
editor = monaco.editor.create(container, {
    value: content,
    language: 'c',
    theme: 'retro-dark',
    fontSize: 14,
    tabSize: 4,
    bracketPairColorization: { enabled: true },
    autoIndent: 'full',
    formatOnPaste: true,
    // ... más configuraciones
});
```

### Tokenizador Personalizado
Se ha implementado un tokenizador específico para C que reconoce:
- Keywords de C estándar
- Tipos de datos primitivos y definidos por usuario
- Directivas de preprocesador
- Operadores y símbolos
- Literales (números, strings, caracteres)

## 📋 Uso

### 1. **Seleccionar Plantilla**
1. Abrir Samaruc Code
2. En la barra de herramientas, usar el selector "Seleccionar plantilla..."
3. Elegir una plantilla del grupo "📝 Plantillas de C"
4. El código se carga automáticamente con resaltado de sintaxis

### 2. **Abrir Archivo Existente**
1. Usar "Abrir archivo" o Ctrl+O
2. Seleccionar un archivo .c o .h
3. El resaltado se aplica automáticamente según la extensión

### 3. **Autocompletado**
- Empezar a escribir y aparecerán sugerencias
- Usar Ctrl+Espacio para forzar autocompletado
- Las funciones incluyen documentación contextual

## 🎯 Beneficios

### Para el Desarrollador:
- **Mayor legibilidad** del código
- **Detección visual** de errores de sintaxis
- **Productividad mejorada** con autocompletado
- **Navegación fácil** con plegado de código

### Para el Aprendizaje:
- **Identificación visual** de conceptos de C
- **Plantillas educativas** con ejemplos prácticos
- **Retroalimentación inmediata** sobre sintaxis

## 🚀 Funcionalidades Avanzadas

### Atajos de Teclado:
- **Ctrl+S**: Guardar archivo
- **F5**: Compilar proyecto
- **F6**: Compilar y ejecutar
- **Ctrl+Espacio**: Autocompletado
- **Ctrl+/**: Comentar/descomentar línea

### Características del Editor:
- **Múltiples cursores**: Alt+Click
- **Selección de columna**: Shift+Alt+Arrastrar  
- **Buscar y reemplazar**: Ctrl+F / Ctrl+H
- **Ir a línea**: Ctrl+G
- **Plegar código**: Ctrl+Shift+[/]

## 📚 Recursos Adicionales

### Headers Comunes Incluidos:
```c
#include <stdio.h>    // Entrada/Salida estándar
#include <stdlib.h>   // Funciones de biblioteca estándar  
#include <string.h>   // Manipulación de cadenas
#include <math.h>     // Funciones matemáticas
#include <time.h>     // Funciones de tiempo
```

### Funciones Frecuentes:
- `printf()`, `scanf()`, `fprintf()`
- `malloc()`, `free()`, `calloc()`
- `strlen()`, `strcpy()`, `strcmp()`
- `fopen()`, `fclose()`, `fgets()`

## 🐛 Solución de Problemas

### Si el resaltado no funciona:
1. Verificar que Monaco Editor se cargó correctamente
2. Revisar la consola del desarrollador (F12)
3. Asegurar conexión a internet (para CDN de Monaco)

### Si las plantillas no aparecen:
1. Verificar que `helpers.js` se cargó correctamente
2. Refrescar la aplicación (Ctrl+R)
3. Verificar la consola para errores de JavaScript

---

**Samaruc Code** - IDE para desarrollo de juegos retro en C  
🐟 Versión con resaltado de sintaxis mejorado
