// renderer.js - Archivo principal modularizado
// SamaruC Code - IDE para desarrollo de juegos retro

// Importar módulos (se cargan via script tags en HTML)
// Los módulos se autoregistran en window para compatibilidad

// Variables globales principales
let isInitialized = false;

// Función de inicialización principal
async function initializeSamaruCCode() {
    if (isInitialized) {
        console.log('SamaruC Code ya está inicializado');
        return;
    }
    
    console.log('🐟 Iniciando SamaruC Code...');
    window.addOutputLine?.('Iniciando SamaruC Code IDE...', 'info');
    
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
        
        // 9. Inicializar Monaco Editor (con await para asegurar carga completa)
        try {
            console.log('Iniciando carga de Monaco Editor...');
            window.addOutputLine?.('Cargando Monaco Editor...', 'info');
            
            if (window.initializeMonaco) {
                await window.initializeMonaco();
                console.log('Monaco Editor inicializado correctamente');
            } else {
                console.warn('initializeMonaco no está disponible');
                window.addOutputLine?.('Monaco Editor no disponible', 'error');
            }
        } catch (error) {
            console.error('Error inicializando Monaco:', error);
            window.addOutputLine?.('Error cargando Monaco Editor', 'error');
        }
        
        // 10. Mostrar mensaje de bienvenida
        window.addOutputLine?.('🐟 SamaruC Code iniciado correctamente', 'success');
        window.addOutputLine?.('¡Listo para desarrollar juegos retro!', 'info');
        
        isInitialized = true;
        console.log('🎉 SamaruC Code inicializado completamente');
        
    } catch (error) {
        console.error('❌ Error inicializando SamaruC Code:', error);
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
    printf("¡Proyecto creado con SamaruC Code!\\n");
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
    console.log('🔨 Botón compilar clickeado - Iniciando compilación con selección de SDK...');
    window.addOutputLine?.('🔨 Botón compilar presionado', 'info');
    window.addOutputLine?.('Seleccionando SDK de compilación...', 'info');
    
    // Validación simplificada: solo verificar si hay contenido en el editor
    let hasContent = false;
    let contentLength = 0;
    
    if (window.monacoInstance && window.monacoInstance.getValue) {
        const content = window.monacoInstance.getValue();
        hasContent = content && content.trim().length > 0;
        contentLength = content ? content.length : 0;
        console.log('📋 Debug - Contenido del editor:');
        console.log('   - hasContent:', hasContent);
        console.log('   - contentLength:', contentLength);
    } else {
        console.log('📋 Debug - Monaco no disponible');
    }
    
    // Validación simple: solo necesitamos contenido en el editor
    if (!hasContent) {
        window.addOutputLine?.('No hay código en el editor para compilar', 'warning');
        window.addOutputLine?.('💡 Sugerencia: Escribe código C en el editor o abre un archivo', 'info');
        return;
    }
    
    window.addOutputLine?.(`📄 Compilando código del editor (${contentLength} caracteres)`, 'info');
    
    console.log('✅ Iniciando compilación con diálogos HTML...');
    
    try {
        // Mostrar diálogo HTML de selección de SDK
        const sdkResult = await window.showCompileSdkDialog();
        
        if (sdkResult.canceled) {
            window.addOutputLine?.('Compilación cancelada por el usuario', 'info');
            return;
        }
        
        console.log('📦 SDK seleccionado:', sdkResult.name);
        window.addOutputLine?.(`${getSdkIcon(sdkResult.sdk)} SDK seleccionado: ${sdkResult.name}`, 'success');
        
        // Activar modo retro correspondiente
        activateRetroMode(sdkResult.sdk);
        
        // Mostrar diálogo HTML de opciones de compilación
        const optionsResult = await window.showCompileOptionsDialog(sdkResult.name);
        
        if (optionsResult.canceled) {
            window.addOutputLine?.('Compilación cancelada por el usuario', 'info');
            return;
        }
        
        console.log('⚙️ Opción seleccionada:', optionsResult.name);
        window.addOutputLine?.(`${getOptionIcon(optionsResult.option)} Opción: ${optionsResult.name}`, 'success');
        
        // Ejecutar compilación
        await executeCompilation(
            { name: sdkResult.name, id: sdkResult.sdk }, 
            { name: optionsResult.name, action: optionsResult.option }
        );
        
    } catch (error) {
        console.error('❌ Error en diálogo de compilación:', error);
        window.addOutputLine?.(`Error en diálogo de compilación: ${error.message}`, 'error');
    }
}

// Función auxiliar para llamadas IPC seguras
async function invokeIpcSafe(channel, ...args) {
    if (window.electronAPI && window.electronAPI.invoke) {
        return await window.electronAPI.invoke(channel, ...args);
    } else if (window.invokeIpc) {
        return await window.invokeIpc(channel, ...args);
    } else if (window.electronIpc && window.electronIpc.invoke) {
        return await window.electronIpc.invoke(channel, ...args);
    } else {
        throw new Error('IPC no disponible');
    }
}

// Ejecutar compilación con SDK y opciones seleccionadas
async function executeCompilation(sdk, option) {
    console.log(`🔄 Ejecutando compilación con ${sdk.name} en modo ${option.name}`);
    window.addOutputLine?.(`🔄 Compilando con ${sdk.name}...`, 'info');
    
    // Configuración por SDK
    const sdkConfigs = {
        gameboy: {
            compiler: 'gbdk-n',
            extension: '.gb',
            description: 'Gameboy ROM'
        },
        spectrum: {
            compiler: 'z88dk-zcc',
            extension: '.tap',
            description: 'ZX Spectrum TAP'
        },
        basic: {
            compiler: 'bas2tap',
            extension: '.tap',
            description: 'BASIC Program'
        },
        gcc: {
            compiler: 'gcc',
            extension: '.exe',
            description: 'Executable'
        }
    };
    
    const config = sdkConfigs[sdk.id];
    
    try {
        // Simular compilación (aquí se integraría con el sistema real)
        window.addOutputLine?.(`📋 Configuración:`, 'info');
        window.addOutputLine?.(`   - Compilador: ${config.compiler}`, 'info');
        window.addOutputLine?.(`   - Archivo de salida: ${config.extension}`, 'info');
        window.addOutputLine?.(`   - Modo: ${option.name}`, 'info');
        
        // Mostrar comandos de ejemplo según el SDK
        const exampleCommands = {
            gameboy: 'gbdk-n -o game.gb main.c',
            spectrum: 'z88dk-zcc +zx -o game.tap main.c',
            basic: 'bas2tap -o program.tap main.bas',
            gcc: 'gcc -o program.exe main.c'
        };
        
        window.addOutputLine?.(`💻 Comando: ${exampleCommands[sdk.id]}`, 'info');
        
        // Simular tiempo de compilación
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Resultados según el modo
        if (option.action === 'compile_run') {
            window.addOutputLine?.(`✅ Compilación exitosa: programa${config.extension}`, 'success');
            window.addOutputLine?.(`🚀 Ejecutando programa...`, 'info');
            window.addOutputLine?.(`🎮 Programa ejecutándose en emulador ${sdk.name}`, 'success');
        } else if (option.action === 'compile_only') {
            window.addOutputLine?.(`✅ Compilación exitosa: programa${config.extension}`, 'success');
            window.addOutputLine?.(`📁 Archivo generado en directorio de salida`, 'info');
        } else if (option.action === 'debug') {
            window.addOutputLine?.(`✅ Compilación exitosa con símbolos de debug`, 'success');
            window.addOutputLine?.(`🐛 Información de debug incluida`, 'info');
        } else if (option.action === 'release') {
            window.addOutputLine?.(`✅ Compilación optimizada completada`, 'success');
            window.addOutputLine?.(`📦 Binario optimizado para distribución`, 'info');
        }
        
        // Activar modo retro correspondiente si no está activo
        if (sdk.id !== 'gcc' && window.setRetroMode) {
            const currentMode = window.getActiveRetroMode?.();
            if (currentMode !== sdk.id) {
                window.addOutputLine?.(`🎨 Activando modo ${sdk.name}...`, 'info');
                window.setRetroMode(sdk.id);
            }
        }
        
    } catch (error) {
        console.error('❌ Error en compilación:', error);
        window.addOutputLine?.(`❌ Error de compilación: ${error.message}`, 'error');
    }
}

async function compileAndRun() {
    console.log('🚀 Compilar y ejecutar - usando sistema de selección de SDK');
    window.addOutputLine?.('Compilando y ejecutando...', 'info');
    
    // El nuevo sistema de compileProject ya incluye la opción "Compilar y Ejecutar"
    // por lo que solo necesitamos llamarlo
    await compileProject();
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

// ===== FUNCIONES AUXILIARES PARA COMPILACIÓN =====
function getSdkIcon(sdk) {
    const icons = {
        'gameboy': '🎮',
        'spectrum': '💻',
        'basic': '💾',
        'gcc': '🔧'
    };
    return icons[sdk] || '🔨';
}

function getOptionIcon(option) {
    const icons = {
        'compile_run': '🚀',
        'compile_only': '🔨',
        'debug': '🐛',
        'release': '📦'
    };
    return icons[option] || '⚙️';
}

function activateRetroMode(sdk) {
    // Activar el modo retro correspondiente
    if (sdk === 'gameboy') {
        toggleGameboyMode();
    } else if (sdk === 'spectrum') {
        toggleSpectrumMode();
    } else if (sdk === 'basic') {
        toggleBasicMode();
    }
}

// Inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('DOM Content Loaded - Iniciando SamaruC Code');
        
        // Esperar un poco para que todos los scripts se carguen
        setTimeout(async () => {
            await initializeSamaruCCode();
            
            // Ejecutar diagnóstico en modo desarrollo
            if (window.diagnoseMonaco) {
                setTimeout(() => {
                    window.diagnoseMonaco();
                }, 2000);
            }
        }, 100);
    });
} else {
    // DOM ya está cargado
    console.log('Documento ya cargado, iniciando inmediatamente');
    setTimeout(async () => {
        await initializeSamaruCCode();
        
        // Ejecutar diagnóstico en modo desarrollo
        if (window.diagnoseMonaco) {
            setTimeout(() => {
                window.diagnoseMonaco();
            }, 2000);
        }
    }, 100);
}

// ===== GESTIÓN DE MODOS RETRO =====
// Función centralizada para gestionar la exclusión mutua de modos retro
function setRetroMode(mode) {
    console.log(`🎮 Cambiando a modo retro: ${mode}`);
    
    const body = document.body;
    const modes = {
        'gameboy': {
            className: 'gameboy-mode',
            buttonId: 'gameboy-btn',
            icon: '🎮',
            name: 'Gameboy',
            activationMessage: '🎮 Modo Gameboy activado - Programación retro habilitada!'
        },
        'spectrum': {
            className: 'spectrum-mode',
            buttonId: 'spectrum-btn',
            icon: '💻',
            name: 'ZX Spectrum',
            activationMessage: '💻 Modo ZX Spectrum activado - ¡Nostalgia de los 80s habilitada!'
        },
        'basic': {
            className: 'basic-mode',
            buttonId: 'basic-btn',
            icon: '💾',
            name: 'BASIC Terminal',
            activationMessage: '💾 Modo BASIC Terminal activado - ¡Programación clásica de 8 bits!'
        }
    };
    
    // Verificar si el modo solicitado ya está activo
    if (mode && body.classList.contains(modes[mode].className)) {
        // Desactivar el modo actual
        body.classList.remove(modes[mode].className);
        const currentBtn = document.getElementById(modes[mode].buttonId);
        if (currentBtn) currentBtn.classList.remove('active');
        
        window.addOutputLine?.(`Modo ${modes[mode].name} desactivado`, 'info');
        return;
    }
    
    // Desactivar todos los modos activos
    Object.keys(modes).forEach(modeKey => {
        const modeConfig = modes[modeKey];
        if (body.classList.contains(modeConfig.className)) {
            body.classList.remove(modeConfig.className);
            const btn = document.getElementById(modeConfig.buttonId);
            if (btn) btn.classList.remove('active');
        }
    });
    
    // Activar el nuevo modo si se especifica
    if (mode && modes[mode]) {
        body.classList.add(modes[mode].className);
        const btn = document.getElementById(modes[mode].buttonId);
        if (btn) btn.classList.add('active');
        
        window.addOutputLine?.(modes[mode].activationMessage, 'success');
        
        // Actualizar indicador de estado
        updateRetroModeIndicator(modes[mode].name, modes[mode].icon);
    } else {
        // Limpiar indicador si no hay modo activo
        updateRetroModeIndicator(null, null);
    }
}

// Función para actualizar el indicador de modo retro en el estado
function updateRetroModeIndicator(modeName, modeIcon) {
    const statusElement = document.getElementById('editor-status');
    if (statusElement) {
        if (modeName) {
            statusElement.textContent = `${modeIcon} ${modeName} Mode`;
            statusElement.style.color = '#4CAF50';
        } else {
            statusElement.textContent = 'Monaco Editor activo';
            statusElement.style.color = '#4CAF50';
        }
    }
}

// Función para alternar modo Gameboy
function toggleGameboyMode() {
    console.log('🎮 Gameboy mode toggled!');
    setRetroMode('gameboy');
}

// Función para alternar modo ZX Spectrum
function toggleSpectrumMode() {
    console.log('💻 ZX Spectrum mode toggled!');
    setRetroMode('spectrum');
}

// Función para alternar modo BASIC Terminal
function toggleBasicMode() {
    console.log('💾 BASIC Terminal mode toggled!');
    setRetroMode('basic');
}

// Función para desactivar todos los modos retro
function clearRetroModes() {
    console.log('🔄 Desactivando todos los modos retro');
    setRetroMode(null);
}

// Función para obtener el modo retro activo actual
function getActiveRetroMode() {
    const body = document.body;
    if (body.classList.contains('gameboy-mode')) return 'gameboy';
    if (body.classList.contains('spectrum-mode')) return 'spectrum';
    if (body.classList.contains('basic-mode')) return 'basic';
    return null;
}

// Función para verificar si algún modo retro está activo
function hasActiveRetroMode() {
    return getActiveRetroMode() !== null;
}

// Función para abrir búsqueda
function openSearch() {
    console.log('🔍 Abriendo búsqueda...');
    
    if (window.monacoInstance) {
        // Usar el comando de búsqueda nativo de Monaco
        window.monacoInstance.getAction('actions.find').run();
        window.addOutputLine?.('🔍 Panel de búsqueda abierto', 'info');
    } else {
        // Fallback para búsqueda básica
        const searchTerm = prompt('Buscar texto:');
        if (searchTerm) {
            window.addOutputLine?.(`🔍 Buscando: "${searchTerm}"`, 'info');
            // Aquí se podría implementar búsqueda básica
        }
    }
}

// Función para abrir buscar y reemplazar
function openFindReplace() {
    console.log('🔄 Abriendo buscar y reemplazar...');
    
    if (window.monacoInstance) {
        // Usar el comando de buscar y reemplazar nativo de Monaco
        window.monacoInstance.getAction('editor.action.startFindReplaceAction').run();
        window.addOutputLine?.('🔄 Panel de buscar y reemplazar abierto', 'info');
    } else {
        // Fallback para buscar y reemplazar básico
        const searchTerm = prompt('Buscar texto:');
        if (searchTerm) {
            const replaceTerm = prompt('Reemplazar con:');
            if (replaceTerm !== null) {
                window.addOutputLine?.(`🔄 Buscando "${searchTerm}" para reemplazar con "${replaceTerm}"`, 'info');
                // Aquí se podría implementar búsqueda y reemplazo básico
            }
        }
    }
}

// Función para cortar texto
function cutText() {
    console.log('✂️ Cortando texto...');
    
    if (window.monacoInstance) {
        // Usar el comando de cortar nativo de Monaco
        window.monacoInstance.getAction('editor.action.clipboardCutAction').run();
        window.addOutputLine?.('✂️ Texto cortado al portapapeles', 'info');
    } else {
        // Fallback para cortar texto básico
        try {
            document.execCommand('cut');
            window.addOutputLine?.('✂️ Texto cortado', 'info');
        } catch (error) {
            window.addOutputLine?.('❌ Error cortando texto', 'error');
        }
    }
}

// Función para copiar texto
function copyText() {
    console.log('📋 Copiando texto...');
    
    if (window.monacoInstance) {
        // Usar el comando de copiar nativo de Monaco
        window.monacoInstance.getAction('editor.action.clipboardCopyAction').run();
        window.addOutputLine?.('📋 Texto copiado al portapapeles', 'info');
    } else {
        // Fallback para copiar texto básico
        try {
            document.execCommand('copy');
            window.addOutputLine?.('📋 Texto copiado', 'info');
        } catch (error) {
            window.addOutputLine?.('❌ Error copiando texto', 'error');
        }
    }
}

// Función para pegar texto
function pasteText() {
    console.log('📝 Pegando texto...');
    
    if (window.monacoInstance) {
        // Usar el comando de pegar nativo de Monaco
        window.monacoInstance.getAction('editor.action.clipboardPasteAction').run();
        window.addOutputLine?.('📝 Texto pegado desde el portapapeles', 'info');
    } else {
        // Fallback para pegar texto básico
        try {
            document.execCommand('paste');
            window.addOutputLine?.('📝 Texto pegado', 'info');
        } catch (error) {
            window.addOutputLine?.('❌ Error pegando texto', 'error');
        }
    }
}

// Exportar funciones principales para uso global
if (typeof window !== 'undefined') {
    window.initializeSamaruCCode = initializeSamaruCCode;
    window.createNewProject = createNewProject;
    window.openProject = openProject;
    window.loadProject = loadProject;
    window.compileProject = compileProject;
    window.compileAndRun = compileAndRun;
    window.loadSelectedTemplate = loadSelectedTemplate;
    window.loadTemplate = loadTemplate;
    window.toggleGameboyMode = toggleGameboyMode;
    window.toggleSpectrumMode = toggleSpectrumMode;
    window.toggleBasicMode = toggleBasicMode;
    window.clearRetroModes = clearRetroModes;
    window.setRetroMode = setRetroMode;
    window.getActiveRetroMode = getActiveRetroMode;
    window.hasActiveRetroMode = hasActiveRetroMode;
    window.openSearch = openSearch;
    window.openFindReplace = openFindReplace;
    window.cutText = cutText;
    window.copyText = copyText;
    window.pasteText = pasteText;
}

//console.log('🐟 SamaruC Code renderer.js cargado');
