// renderer.js - Archivo principal modularizado
// Samaruc Code - IDE para desarrollo de juegos retro

// Importar módulos (se cargan via script tags en HTML)
// Los módulos se autoregistran en window para compatibilidad

// Variables globales principales
let isInitialized = false;

// Función de inicialización principal
async function initializeSamarucCode() {
    if (isInitialized) {
        console.log('Samaruc Code ya está inicializado');
        return;
    }
    
    console.log('🐟 Iniciando Samaruc Code...');
    window.addOutputLine?.('Iniciando Samaruc Code IDE...', 'info');
    
    try {
        // 1. Configurar manejo de errores
        window.setupErrorHandling?.();
        
        // 2. Configurar tema
        window.setupTheme?.();
        
        // 3. Solicitar permisos necesarios
        window.requestNotificationPermission?.();
        
        // 4. Inicializar IPC de Electron
        const ipcInitialized = window.initializeElectronIpc?.();
        if (ipcInitialized) {
            console.log('✅ Electron IPC inicializado');
        } else {
            console.log('⚠️ Ejecutándose en modo navegador (sin Electron)');
        }
        
        // 5. Inicializar archivos recientes
        window.initializeRecentFiles?.();
        
        // 6. Configurar drag and drop
        window.initializeDragAndDrop?.();
        
        // 7. Configurar event listeners
        window.setupEventListeners?.();
        
        // 8. Configurar manejadores de menú (si Electron está disponible)
        if (window.electronIpc) {
            window.setupMenuHandlers?.();
        }
        
        // 9. Inicializar Monaco Editor
        window.initializeMonaco?.();
        
        // 10. Mostrar mensaje de bienvenida
        window.addOutputLine?.('🐟 Samaruc Code iniciado correctamente', 'success');
        window.addOutputLine?.('¡Listo para desarrollar juegos retro!', 'info');
        
        isInitialized = true;
        console.log('🎉 Samaruc Code inicializado completamente');
        
    } catch (error) {
        console.error('❌ Error inicializando Samaruc Code:', error);
        window.addOutputLine?.(`Error de inicialización: ${error.message}`, 'error');
    }
}

// Funciones de proyectos y construcción (placeholders - se implementan en otros módulos)
async function createNewProject() {
    console.log('createNewProject llamada');
    
    try {
        const projectName = await window.showCustomDialog?.(
            'Nuevo Proyecto',
            'Introduce el nombre del proyecto:',
            'prompt',
            'mi-juego-retro'
        );
        
        if (!projectName) {
            window.addOutputLine?.('Creación de proyecto cancelada', 'info');
            return;
        }
        
        // Validar nombre del proyecto
        if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
            window.addOutputLine?.('Nombre de proyecto inválido. Use solo letras, números, guiones y guiones bajos.', 'error');
            return;
        }
        
        window.addOutputLine?.(`Creando proyecto: ${projectName}`, 'info');
        
        // Si Electron está disponible, crear proyecto real
        if (window.electronIpc) {
            try {
                const result = await window.electronIpc.invoke('create-project', projectName);
                if (result.success) {
                    window.addOutputLine?.(`Proyecto creado en: ${result.projectPath}`, 'success');
                    window.currentProject = result.projectPath;
                    
                    // Abrir archivo principal si existe
                    if (result.mainFile) {
                        await window.openFileFromPath?.(result.mainFile);
                    }
                } else {
                    window.addOutputLine?.(`Error creando proyecto: ${result.error}`, 'error');
                }
            } catch (error) {
                window.addOutputLine?.(`Error con IPC: ${error.message}`, 'error');
            }
        } else {
            // Fallback: crear proyecto básico en memoria
            const mainContent = `// Proyecto: ${projectName}
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Hola desde ${projectName}!\\n");
    printf("¡Proyecto creado con Samaruc Code!\\n");
    return 0;
}`;
            
            window.openFileInEditor?.(`${projectName}/main.c`, mainContent, true);
            window.addOutputLine?.(`Proyecto básico creado: ${projectName}`, 'success');
        }
        
    } catch (error) {
        console.error('Error creando proyecto:', error);
        window.addOutputLine?.(`Error creando proyecto: ${error.message}`, 'error');
    }
}

async function openProject() {
    console.log('openProject llamada');
    window.addOutputLine?.('Abriendo proyecto...', 'info');
    
    if (window.electronIpc) {
        try {
            const result = await window.electronIpc.invoke('show-open-dialog', {
                properties: ['openDirectory'],
                title: 'Abrir carpeta del proyecto'
            });
            
            if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                const projectPath = result.filePaths[0];
                await loadProject(projectPath);
            }
        } catch (error) {
            window.addOutputLine?.(`Error abriendo proyecto: ${error.message}`, 'error');
        }
    } else {
        window.addOutputLine?.('Función de abrir proyecto no disponible en modo navegador', 'warning');
    }
}

async function loadProject(projectPath) {
    if (!projectPath) return;
    
    window.addOutputLine?.(`Cargando proyecto: ${projectPath}`, 'info');
    window.currentProject = projectPath;
    
    // Buscar archivos principales del proyecto
    if (window.electronIpc) {
        try {
            const files = await window.electronIpc.invoke('list-project-files', projectPath);
            if (files.success && files.files.length > 0) {
                // Abrir el primer archivo C encontrado
                const mainFile = files.files.find(f => f.endsWith('.c')) || files.files[0];
                if (mainFile) {
                    await window.openFileFromPath?.(mainFile);
                }
                window.addOutputLine?.(`Proyecto cargado con ${files.files.length} archivos`, 'success');
            }
        } catch (error) {
            window.addOutputLine?.(`Error listando archivos del proyecto: ${error.message}`, 'error');
        }
    }
}

async function compileProject() {
    window.addOutputLine?.('Compilando proyecto...', 'info');
    
    if (!window.activeFile) {
        window.addOutputLine?.('No hay archivo activo para compilar', 'warning');
        return;
    }
    
    if (window.electronIpc) {
        try {
            const result = await window.electronIpc.invoke('compile-file', window.activeFile);
            if (result.success) {
                window.addOutputLine?.('Compilación exitosa', 'success');
                window.addOutputLine?.(result.output, 'info');
            } else {
                window.addOutputLine?.('Error de compilación', 'error');
                window.addOutputLine?.(result.error, 'error');
            }
        } catch (error) {
            window.addOutputLine?.(`Error en compilación: ${error.message}`, 'error');
        }
    } else {
        window.addOutputLine?.('Compilación no disponible en modo navegador', 'warning');
    }
}

async function compileAndRun() {
    window.addOutputLine?.('Compilando y ejecutando...', 'info');
    await compileProject();
    
    // Aquí se ejecutaría el programa compilado
    if (window.electronIpc) {
        setTimeout(async () => {
            try {
                const result = await window.electronIpc.invoke('run-executable', window.activeFile);
                if (result.success) {
                    window.addOutputLine?.('Ejecutando programa...', 'info');
                    window.addOutputLine?.(result.output, 'success');
                } else {
                    window.addOutputLine?.(`Error ejecutando: ${result.error}`, 'error');
                }
            } catch (error) {
                window.addOutputLine?.(`Error ejecutando: ${error.message}`, 'error');
            }
        }, 1000);
    }
}

// Funciones de plantillas
async function loadSelectedTemplate() {
    const templateSelect = document.getElementById('template-select');
    if (!templateSelect || !templateSelect.value) {
        window.addOutputLine?.('Por favor selecciona una plantilla', 'warning');
        return;
    }
    
    await loadTemplate(templateSelect.value);
}

async function loadTemplate(templateName) {
    window.addOutputLine?.(`Cargando plantilla: ${templateName}`, 'info');
    
    if (window.electronIpc) {
        try {
            const result = await window.electronIpc.invoke('load-template', templateName);
            if (result.success) {
                window.openFileInEditor?.(`${templateName}.c`, result.content, true);
                window.addOutputLine?.(`Plantilla cargada: ${templateName}`, 'success');
            } else {
                window.addOutputLine?.(`Error cargando plantilla: ${result.error}`, 'error');
            }
        } catch (error) {
            window.addOutputLine?.(`Error cargando plantilla: ${error.message}`, 'error');
        }
    } else {
        // Plantillas locales (incluyen las nuevas de C)
        const templates = {
            // Plantillas de juegos existentes
            'spectrum': `// Plantilla para ZX Spectrum
#include <stdio.h>
#include <spectrum.h>

int main() {
    // Código para ZX Spectrum
    printf("Hola Spectrum!");
    return 0;
}`,
            'c64': `// Plantilla para Commodore 64
#include <stdio.h>
#include <c64.h>

int main() {
    // Código para C64
    printf("Hola C64!");
    return 0;
}`,
            'basic-game': `// Juego básico
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    // Inicializar generador de números aleatorios
    srand(time(NULL));
    
    printf("=== 🎮 JUEGO BÁSICO ===\\n");
    printf("¡Bienvenido al juego!\\n");
    
    // Tu código de juego aquí
    
    return 0;
}`,
            
            // Nuevas plantillas de C
            'c-basic': window.cHelpers?.getTemplate('basic') || `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
            
            'c-args': window.cHelpers?.getTemplate('withArgs') || `#include <stdio.h>

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
            
            'c-struct': window.cHelpers?.getTemplate('struct') || `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
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
            
            'c-fileio': window.cHelpers?.getTemplate('fileIO') || `#include <stdio.h>
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
            
            'c-memory': window.cHelpers?.getTemplate('memory') || `#include <stdio.h>
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
        };
        
        if (templates[templateName]) {
            // Determinar el nombre del archivo según la plantilla
            let fileName = 'nuevo_archivo.c';
            if (templateName.startsWith('c-')) {
                const templateType = templateName.replace('c-', '');
                fileName = `${templateType}_ejemplo.c`;
            } else if (templateName.includes('game')) {
                fileName = `${templateName.replace('-', '_')}.c`;
            }
            
            // Abrir el archivo con la plantilla
            window.openFileInEditor?.(fileName, templates[templateName], true);
            window.addOutputLine?.(`✅ Plantilla '${templateName}' cargada correctamente`, 'success');
        } else {
            window.addOutputLine?.(`❌ Plantilla '${templateName}' no encontrada`, 'error');
        }
    }
}

// Inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSamarucCode);
} else {
    // DOM ya está cargado
    initializeSamarucCode();
}

// Exportar funciones principales para uso global
if (typeof window !== 'undefined') {
    window.initializeSamarucCode = initializeSamarucCode;
    window.createNewProject = createNewProject;
    window.openProject = openProject;
    window.loadProject = loadProject;
    window.compileProject = compileProject;
    window.compileAndRun = compileAndRun;
    window.loadSelectedTemplate = loadSelectedTemplate;
    window.loadTemplate = loadTemplate;
}

//console.log('🐟 Samaruc Code renderer.js cargado');
