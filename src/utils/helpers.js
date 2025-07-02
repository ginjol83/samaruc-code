// helpers.js - Funciones auxiliares y utilitarios
// SamaruC Code - IDE para desarrollo de juegos retro

// Helpers seguros para evitar errores de require
function getIpcRenderer() {
    try {
        const { ipcRenderer } = require('electron');
        return ipcRenderer;
    } catch (error) {
        console.error('Error obteniendo ipcRenderer:', error);
        return null;
    }
}

function getFs() {
    try {
        if (typeof require !== 'undefined' && typeof window !== 'undefined' && window.require) {
            return window.require('fs');
        }
    } catch (error) {
        console.warn('fs no disponible:', error.message);
    }
    return null;
}

// Utilidades de path seguras (sin require)
const safePath = {
    basename: (filePath) => {
        if (!filePath || typeof filePath !== 'string') return '';
        return filePath.split(/[\\/]/).pop() || '';
    },
    extname: (filePath) => {
        if (!filePath || typeof filePath !== 'string') return '';
        const name = safePath.basename(filePath);
        const lastDot = name.lastIndexOf('.');
        return lastDot > 0 ? name.substring(lastDot) : '';
    },
    dirname: (filePath) => {
        if (!filePath || typeof filePath !== 'string') return '';
        const parts = filePath.split(/[\\/]/);
        parts.pop();
        return parts.join('/') || '/';
    },
    join: (...parts) => {
        const validParts = parts.filter(part => part && typeof part === 'string');
        return validParts.join('/').replace(/\/+/g, '/');
    }
};

// Función para detectar archivos binarios
function isBinaryFile(content) {
    if (typeof content !== 'string') return true;
    
    // Verificar caracteres de control que indican contenido binario
    for (let i = 0; i < Math.min(content.length, 8000); i++) {
        const code = content.charCodeAt(i);
        // Permitir: tab (9), line feed (10), carriage return (13), y caracteres imprimibles (32-126)
        if (code < 9 || (code > 13 && code < 32) || code === 127) {
            return true;
        }
    }
    return false;
}

// Funciones auxiliares de UI
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateWindowTitle(filePath) {
    if (filePath) {
        document.title = `SamaruC Code - ${safePath.basename(filePath)}`;
    } else {
        document.title = 'SamaruC Code';
    }
}

// Obtener lenguaje por extensión
function getLanguageFromFile(filePath) {
    const ext = safePath.extname(filePath).toLowerCase();
    const fileName = safePath.basename(filePath).toLowerCase();
    
    // Mapeo de extensiones a lenguajes de Monaco Editor
    const languageMap = {
        // C/C++
        '.c': 'c',
        '.h': 'c',
        '.cpp': 'cpp',
        '.cc': 'cpp',
        '.cxx': 'cpp',
        '.c++': 'cpp',
        '.hpp': 'cpp',
        '.hh': 'cpp',
        '.hxx': 'cpp',
        '.h++': 'cpp',
        
        // Web
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.json': 'json',
        '.html': 'html',
        '.htm': 'html',
        '.css': 'css',
        '.scss': 'scss',
        '.sass': 'sass',
        '.less': 'less',
        
        // Scripts
        '.py': 'python',
        '.java': 'java',
        '.cs': 'csharp',
        '.php': 'php',
        '.rb': 'ruby',
        '.go': 'go',
        '.rs': 'rust',
        '.swift': 'swift',
        '.kt': 'kotlin',
        
        // Shell
        '.sh': 'shell',
        '.bash': 'shell',
        '.zsh': 'shell',
        '.fish': 'shell',
        '.ps1': 'powershell',
        '.bat': 'bat',
        '.cmd': 'bat',
        
        // Config
        '.xml': 'xml',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.toml': 'toml',
        '.ini': 'ini',
        '.cfg': 'ini',
        '.conf': 'ini',
        
        // Documentation
        '.md': 'markdown',
        '.markdown': 'markdown',
        '.txt': 'plaintext',
        '.log': 'plaintext',
        
        // Build systems
        '.cmake': 'cmake',
        '.dockerfile': 'dockerfile',
        '.makefile': 'makefile',
        
        // SQL
        '.sql': 'sql',
        
        // Others
        '.r': 'r',
        '.m': 'objective-c',
        '.mm': 'objective-c'
    };
    
    // Casos especiales por nombre de archivo
    const specialFiles = {
        'makefile': 'makefile',
        'cmakelists.txt': 'cmake',
        'dockerfile': 'dockerfile',
        'readme': 'markdown',
        'license': 'plaintext',
        'changelog': 'markdown',
        'todo': 'plaintext'
    };
    
    // Verificar archivos especiales primero
    if (specialFiles[fileName]) {
        return specialFiles[fileName];
    }
    
    // Usar mapeo de extensiones
    return languageMap[ext] || 'plaintext';
}

// Funciones específicas para desarrollo en C
const cHelpers = {
    // Plantillas de código C comunes
    templates: {
        basic: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
        
        withArgs: `#include <stdio.h>

int main(int argc, char *argv[]) {
    if (argc > 1) {
        printf("Argumentos recibidos: %d\\n", argc - 1);
        for (int i = 1; i < argc; i++) {
            printf("  Arg %d: %s\\n", i, argv[i]);
        }
    } else {
        printf("No se recibieron argumentos\\n");
    }
    return 0;
}`,
        
        struct: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    // Agregar campos aquí
    char name[50];
    int value;
} MyStruct;

int main() {
    MyStruct item;
    strcpy(item.name, "Ejemplo");
    item.value = 42;
    
    printf("Nombre: %s, Valor: %d\\n", item.name, item.value);
    return 0;
}`,
        
        fileIO: `#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *file;
    char buffer[256];
    
    // Abrir archivo para lectura
    file = fopen("ejemplo.txt", "r");
    if (file == NULL) {
        perror("Error abriendo archivo");
        return 1;
    }
    
    // Leer archivo línea por línea
    while (fgets(buffer, sizeof(buffer), file) != NULL) {
        printf("%s", buffer);
    }
    
    fclose(file);
    return 0;
}`,
        
        memory: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *array;
    int size = 10;
    
    // Asignar memoria
    array = (int*)malloc(size * sizeof(int));
    if (array == NULL) {
        fprintf(stderr, "Error: No se pudo asignar memoria\\n");
        return 1;
    }
    
    // Inicializar array
    for (int i = 0; i < size; i++) {
        array[i] = i * i;
    }
    
    // Mostrar valores
    printf("Valores del array:\\n");
    for (int i = 0; i < size; i++) {
        printf("array[%d] = %d\\n", i, array[i]);
    }
    
    // Liberar memoria
    free(array);
    printf("Memoria liberada\\n");
    
    return 0;
}`
    },
    
    // Funciones comunes de C para autocompletado
    commonFunctions: [
        { name: 'printf', signature: 'int printf(const char *format, ...)', description: 'Imprime texto formateado' },
        { name: 'scanf', signature: 'int scanf(const char *format, ...)', description: 'Lee datos formateados' },
        { name: 'strlen', signature: 'size_t strlen(const char *str)', description: 'Longitud de cadena' },
        { name: 'strcpy', signature: 'char *strcpy(char *dest, const char *src)', description: 'Copia cadena' },
        { name: 'strcmp', signature: 'int strcmp(const char *str1, const char *str2)', description: 'Compara cadenas' },
        { name: 'malloc', signature: 'void *malloc(size_t size)', description: 'Asigna memoria' },
        { name: 'free', signature: 'void free(void *ptr)', description: 'Libera memoria' },
        { name: 'fopen', signature: 'FILE *fopen(const char *filename, const char *mode)', description: 'Abre archivo' },
        { name: 'fclose', signature: 'int fclose(FILE *stream)', description: 'Cierra archivo' },
        { name: 'fgets', signature: 'char *fgets(char *str, int n, FILE *stream)', description: 'Lee línea de archivo' }
    ],
    
    // Headers comunes
    commonHeaders: [
        '#include <stdio.h>    // Entrada/Salida estándar',
        '#include <stdlib.h>   // Funciones de biblioteca estándar',
        '#include <string.h>   // Manipulación de cadenas',
        '#include <math.h>     // Funciones matemáticas',
        '#include <time.h>     // Funciones de tiempo',
        '#include <ctype.h>    // Clasificación de caracteres',
        '#include <stdbool.h>  // Tipo booleano',
        '#include <stdint.h>   // Tipos enteros de tamaño fijo',
        '#include <limits.h>   // Límites de tipos',
        '#include <float.h>    // Límites de tipos flotantes'
    ],
    
    // Obtener plantilla por nombre
    getTemplate: function(templateName) {
        return this.templates[templateName] || this.templates.basic;
    },
    
    // Detectar si un archivo es de C/C++
    isCFile: function(filePath) {
        const ext = safePath.extname(filePath).toLowerCase();
        return ['.c', '.h', '.cpp', '.hpp', '.cc', '.cxx'].includes(ext);
    },
    
    // Generar función básica
    generateFunction: function(name, returnType = 'int', params = []) {
        const paramStr = params.length > 0 ? params.join(', ') : 'void';
        return `${returnType} ${name}(${paramStr}) {
    // TODO: Implementar función
    return 0;
}`;
    }
};

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.getIpcRenderer = getIpcRenderer;
    window.getFs = getFs;
    window.safePath = safePath;
    window.isBinaryFile = isBinaryFile;
    window.formatFileSize = formatFileSize;
    window.updateWindowTitle = updateWindowTitle;
    window.getLanguageFromFile = getLanguageFromFile;
    window.cHelpers = cHelpers;
}
