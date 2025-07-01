// events.js - Gestión de eventos y configuración
// Samaruc Code - IDE para desarrollo de juegos retro

// Configurar event listeners principales
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Verificar que los elementos existan antes de asignar event listeners
    const elements = {
        newFileBtn: document.getElementById('new-file-btn'),
        openFileBtn: document.getElementById('open-file-btn'),
        saveFileBtn: document.getElementById('save-file-btn'),
        compileBtn: document.getElementById('compile-btn'),
        runBtn: document.getElementById('run-btn'),
        loadTemplateBtn: document.getElementById('load-template-btn'),
        openProjectBtn: document.getElementById('open-project-btn')
    };
    
    console.log('Elementos encontrados:', Object.fromEntries(
        Object.entries(elements).map(([key, value]) => [key, !!value])
    ));
    
    // Botones de la toolbar
    if (elements.newFileBtn) elements.newFileBtn.addEventListener('click', window.createNewFile);
    if (elements.openFileBtn) {
        elements.openFileBtn.addEventListener('click', () => {
            console.log('Botón de abrir archivo clickeado');
            window.openFile?.();
        });
    }
    if (elements.saveFileBtn) elements.saveFileBtn.addEventListener('click', window.saveCurrentFile);
    if (elements.compileBtn) elements.compileBtn.addEventListener('click', window.compileProject);
    if (elements.runBtn) elements.runBtn.addEventListener('click', window.compileAndRun);
    if (elements.loadTemplateBtn) elements.loadTemplateBtn.addEventListener('click', window.loadSelectedTemplate);
    if (elements.openProjectBtn) elements.openProjectBtn.addEventListener('click', window.openProject);
    
    // Selector de plantillas
    const templateSelect = document.getElementById('template-select');
    if (templateSelect) {
        templateSelect.addEventListener('change', function() {
            if (this.value) {
                window.loadTemplate?.(this.value);
                this.value = ''; // Resetear selección
            }
        });
    }
    
    // Pestañas del panel inferior
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            window.switchPanel?.(tab.dataset.panel);
        });
    });
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
    
    console.log('Event listeners configurados');
}

// Configurar atajos de teclado
function setupKeyboardShortcuts() {
    try {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N - Nuevo archivo
            if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
                e.preventDefault();
                window.createNewFile?.();
                return;
            }
            
            // Ctrl/Cmd + O - Abrir archivo
            if ((e.ctrlKey || e.metaKey) && e.key === 'o' && !e.shiftKey) {
                e.preventDefault();
                window.openFile?.();
                return;
            }
            
            // Ctrl/Cmd + S - Guardar archivo
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
                e.preventDefault();
                window.saveCurrentFile?.();
                return;
            }
            
            // Ctrl/Cmd + Shift + N - Nuevo proyecto
            if ((e.ctrlKey || e.metaKey) && e.key === 'N' && e.shiftKey) {
                e.preventDefault();
                window.createNewProject?.();
                return;
            }
            
            // Ctrl/Cmd + Shift + O - Abrir proyecto
            if ((e.ctrlKey || e.metaKey) && e.key === 'O' && e.shiftKey) {
                e.preventDefault();
                window.openProject?.();
                return;
            }
            
            // F5 - Compilar/Ejecutar
            if (e.key === 'F5') {
                e.preventDefault();
                window.compileProject?.();
                return;
            }
            
            // Ctrl/Cmd + ` - Alternar panel de salida
            if ((e.ctrlKey || e.metaKey) && e.key === '`') {
                e.preventDefault();
                window.switchPanel?.('output');
                return;
            }
            
            // Escape - Cerrar diálogos
            if (e.key === 'Escape') {
                const dialogs = document.querySelectorAll('.modal:not(.hidden)');
                dialogs.forEach(dialog => dialog.classList.add('hidden'));
                return;
            }
        });
        
        console.log('Atajos de teclado configurados');
    } catch (error) {
        console.warn('Error configurando atajos de teclado:', error);
    }
}

// Configurar drag and drop
function initializeDragAndDrop() {
    try {
        // Prevenir comportamiento por defecto en toda la ventana
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Configurar drop en el editor principal
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                editorContainer.classList.add('drag-over');
            });
            
            editorContainer.addEventListener('dragleave', (e) => {
                e.preventDefault();
                editorContainer.classList.remove('drag-over');
            });
            
            editorContainer.addEventListener('drop', async (e) => {
                e.preventDefault();
                editorContainer.classList.remove('drag-over');
                
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                    const file = files[0];
                    if (file.path) {
                        await window.openFileFromPath?.(file.path);
                    }
                }
            });
        }
        
        console.log('Drag and drop inicializado');
    } catch (error) {
        console.warn('Error inicializando drag and drop:', error);
    }
}

// Configurar manejadores de menú de Electron
function setupMenuHandlers() {
    if (!window.electronIpc) return;
    
    try {
        window.electronIpc.on('menu-new-project', window.createNewProject);
        window.electronIpc.on('menu-open-project', (event, projectPath) => {
            window.loadProject?.(projectPath);
        });
        window.electronIpc.on('menu-save', window.saveCurrentFile);
        window.electronIpc.on('menu-compile', window.compileProject);
        window.electronIpc.on('menu-compile-run', window.compileAndRun);
        window.electronIpc.on('menu-template', (event, templateName) => {
            window.loadTemplate?.(templateName);
        });
        
        console.log('Manejadores de menú configurados');
    } catch (error) {
        console.warn('Error configurando manejadores de menú:', error);
    }
}

// Solicitar permisos de notificación
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Permiso de notificación:', permission);
        });
    }
}

// Configurar tema
function setupTheme() {
    // Aplicar tema oscuro por defecto
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        // El usuario prefiere tema claro, pero mantenemos el oscuro para el look retro
        console.log('Sistema prefiere tema claro, pero manteniendo tema oscuro retro');
    }
    
    // Escuchar cambios en la preferencia del sistema
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            console.log('Cambio en preferencia de tema del sistema:', e.matches ? 'oscuro' : 'claro');
        });
    }
}

// Configurar manejo de errores globales
function setupErrorHandling() {
    // Manejar errores de JavaScript
    window.addEventListener('error', (event) => {
        console.error('Error global:', event.error);
        window.addOutputLine?.(`Error: ${event.error?.message || 'Error desconocido'}`, 'error');
    });
    
    // Manejar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promesa rechazada:', event.reason);
        window.addOutputLine?.(`Error en promesa: ${event.reason?.message || 'Error desconocido'}`, 'error');
    });
    
    console.log('Manejo de errores configurado');
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.setupEventListeners = setupEventListeners;
    window.setupKeyboardShortcuts = setupKeyboardShortcuts;
    window.initializeDragAndDrop = initializeDragAndDrop;
    window.setupMenuHandlers = setupMenuHandlers;
    window.requestNotificationPermission = requestNotificationPermission;
    window.setupTheme = setupTheme;
    window.setupErrorHandling = setupErrorHandling;
}
