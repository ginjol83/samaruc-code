// Terminal integrada para SamaruC Code
// Implementación usando xterm.js y comunicación IPC con el proceso principal

// Debug: Verificar que todos los módulos se han cargado
function debugTerminalStatus() {
    console.log('🔍 Estado del debug terminal:');
    console.log('- terminalManager disponible:', !!window.terminalManager);
    console.log('- Terminal panel existe:', !!document.getElementById('terminal-panel'));
    console.log('- Terminal content existe:', !!document.getElementById('terminal-content'));
    console.log('- switchPanel función disponible:', !!window.switchPanel);
    
    if (window.terminalManager) {
        console.log('- Terminales activos:', window.terminalManager.terminals.size);
        console.log('- Terminal actual:', window.terminalManager.currentTerminalId);
        console.log('- Simple terminal configurado:', window.terminalManager.simpleTerminalConfigured);
        console.log('- Es Electron:', window.terminalManager.isElectron);
        console.log('- IPC disponible:', !!window.terminalManager.ipcRenderer);
    }
    
    // Mostrar información visual también
    const terminalContent = document.getElementById('terminal-content');
    if (terminalContent) {
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = `
            position: absolute;
            top: 30px;
            right: 5px;
            background: rgba(0,0,0,0.8);
            color: #00ff00;
            padding: 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            z-index: 1001;
            max-width: 300px;
        `;
        debugInfo.innerHTML = `
            🔍 DEBUG TERMINAL:<br>
            ✅ TerminalManager: ${!!window.terminalManager}<br>
            ✅ Panel existe: ${!!document.getElementById('terminal-panel')}<br>
            ✅ Content existe: ${!!document.getElementById('terminal-content')}<br>
            ✅ switchPanel: ${!!window.switchPanel}<br>
            ${window.terminalManager ? `
            🔧 Terminales: ${window.terminalManager.terminals.size}<br>
            🔧 Actual: ${window.terminalManager.currentTerminalId}<br>
            🔧 Simple term output: ${!!document.getElementById('simple-terminal-output')}<br>
            🔧 Es Electron: ${window.terminalManager.isElectron}<br>
            🔧 IPC: ${!!window.terminalManager.ipcRenderer}
            ` : ''}
        `;
        
        // Remover debug anterior si existe
        const oldDebug = terminalContent.querySelector('.debug-info');
        if (oldDebug) oldDebug.remove();
        
        debugInfo.className = 'debug-info';
        terminalContent.appendChild(debugInfo);
        
        // Auto-remover después de 8 segundos
        setTimeout(() => {
            if (debugInfo.parentNode) {
                debugInfo.remove();
            }
        }, 8000);
    }
    
    // Intentar inicializar terminal si no existe
    if (window.terminalManager && window.terminalManager.terminals.size === 0 && !document.getElementById('simple-terminal-output')) {
        console.log('🔄 Intentando crear terminal...');
        window.terminalManager.createTerminal();
    }
}

// Hacer disponible globalmente para debug
window.debugTerminalStatus = debugTerminalStatus;

class TerminalManager {
    constructor() {
        this.terminals = new Map(); // ID -> terminal instance
        this.nextTerminalId = 1;
        this.currentTerminalId = null;
        this.simpleTerminalConfigured = false;
        this.isElectron = false; // Se configurará en setupIPC
        this.ipcRenderer = null;
        
        console.log('🔧 TerminalManager constructor ejecutado');
        
        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('📄 DOM listo, inicializando terminal...');
                this.init();
            });
        } else {
            console.log('📄 DOM ya listo, inicializando terminal...');
            // Pequeño delay para asegurar que otros scripts se hayan cargado
            setTimeout(() => this.init(), 100);
        }
    }

    async init() {
        console.log('🖥️ Inicializando TerminalManager...');
        
        // Configurar el panel de terminal primero
        this.setupTerminalPanel();
        
        // Intentar cargar xterm.js, pero no fallar si no está disponible
        try {
            if (typeof Terminal === 'undefined') {
                await this.loadXTerm();
            }
        } catch (error) {
            console.warn('⚠️ xterm.js no disponible, usando terminal simple:', error);
        }
        
        // Crear terminal inicial (siempre, con o sin xterm)
        this.createTerminal();
        
        console.log('✅ TerminalManager iniciado correctamente');
    }

    async loadXTerm() {
        return new Promise((resolve, reject) => {
            console.log('📦 Cargando xterm.js...');
            
            // Cargar CSS de xterm
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '../node_modules/@xterm/xterm/css/xterm.css';
            document.head.appendChild(link);
            
            // Cargar JS de xterm
            const script = document.createElement('script');
            script.src = '../node_modules/@xterm/xterm/lib/xterm.js';
            script.onload = () => {
                console.log('✅ xterm.js cargado');
                resolve();
            };
            script.onerror = (error) => {
                console.error('❌ Error cargando xterm.js:', error);
                // Fallback: crear terminal simple sin xterm
                console.log('🔄 Creando terminal simple sin xterm...');
                this.createSimpleTerminal();
                resolve(); // No fallar, usar terminal simple
            };
            document.head.appendChild(script);
        });
    }

    setupTerminalPanel() {
        const terminalContent = document.getElementById('terminal-content');
        if (!terminalContent) {
            console.error('❌ No se encontró #terminal-content');
            return;
        }

        console.log('🔧 Configurando panel de terminal...');

        // Limpiar contenido existente
        terminalContent.innerHTML = '';

        // Crear estructura básica del terminal
        const terminalContainer = document.createElement('div');
        terminalContainer.className = 'terminal-container';
        terminalContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #1e1e1e;
            color: #ffffff;
        `;

        // Crear barra de herramientas del terminal
        const toolbar = document.createElement('div');
        toolbar.className = 'terminal-toolbar';
        toolbar.style.cssText = `
            background: #2d2d30;
            border-bottom: 1px solid #3e3e42;
            padding: 4px 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 30px;
        `;

        const terminalInfo = document.createElement('span');
        terminalInfo.style.cssText = `
            color: #cccccc;
            font-size: 12px;
        `;
        terminalInfo.textContent = '💻 Terminal - PowerShell';

        const terminalActions = document.createElement('div');
        terminalActions.style.cssText = `
            display: flex;
            gap: 8px;
        `;

        // Botón para nueva terminal
        const newTerminalBtn = document.createElement('button');
        newTerminalBtn.innerHTML = '+ Nueva';
        newTerminalBtn.style.cssText = `
            background: #007ACC;
            color: white;
            border: none;
            padding: 2px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
        `;
        newTerminalBtn.onclick = () => this.createTerminal();

        // Botón para limpiar terminal
        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '🗑️ Limpiar';
        clearBtn.style.cssText = `
            background: #666666;
            color: white;
            border: none;
            padding: 2px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
        `;
        clearBtn.onclick = () => this.clearCurrentTerminal();

        terminalActions.appendChild(newTerminalBtn);
        terminalActions.appendChild(clearBtn);
        toolbar.appendChild(terminalInfo);
        toolbar.appendChild(terminalActions);

        // Crear área de terminales
        const terminalsArea = document.createElement('div');
        terminalsArea.id = 'terminals-area';
        terminalsArea.style.cssText = `
            flex: 1;
            position: relative;
            overflow: hidden;
            background: #1e1e1e;
        `;

        terminalContainer.appendChild(toolbar);
        terminalContainer.appendChild(terminalsArea);
        terminalContent.appendChild(terminalContainer);

        // Configurar IPC para comunicación con el proceso principal
        this.setupIPC();
        
        console.log('✅ Panel de terminal configurado');
    }

    setupIPC() {
        // Verificar si estamos en Electron de manera segura
        this.isElectron = this.checkElectronEnvironment();
        console.log('🔌 Entorno Electron detectado:', this.isElectron);
        
        if (this.isElectron) {
            try {
                const { ipcRenderer } = window.require('electron');
                
                // Escuchar datos de la terminal desde el proceso principal
                ipcRenderer.on('terminal-data', (event, terminalId, data) => {
                    const terminal = this.terminals.get(terminalId);
                    if (terminal && terminal.xterm) {
                        terminal.xterm.write(data);
                    } else {
                        // Terminal simple
                        if (terminalId === 1) {
                            this.addSimpleTerminalOutput(data);
                        }
                    }
                });

                // Escuchar cuando se cierra una terminal
                ipcRenderer.on('terminal-closed', (event, terminalId) => {
                    const terminal = this.terminals.get(terminalId);
                    if (terminal) {
                        if (terminal.xterm) {
                            terminal.xterm.dispose();
                        }
                        if (terminal.element) {
                            terminal.element.remove();
                        }
                        this.terminals.delete(terminalId);
                    }
                });
                
                // Guardar referencia de IPC
                this.ipcRenderer = ipcRenderer;
                console.log('✅ IPC configurado correctamente');
                
            } catch (error) {
                console.warn('⚠️ Error configurando IPC:', error);
                this.isElectron = false;
                this.ipcRenderer = null;
            }
        } else {
            console.log('📄 Modo navegador detectado - IPC no disponible');
            this.ipcRenderer = null;
        }
    }

    checkElectronEnvironment() {
        // Verificar múltiples indicadores de Electron
        try {
            // Verificación 1: window.require existe
            if (typeof window.require !== 'function') {
                return false;
            }
            
            // Verificación 2: process.versions.electron existe
            if (typeof process !== 'undefined' && 
                process.versions && 
                process.versions.electron) {
                return true;
            }
            
            // Verificación 3: Intentar require de electron de forma segura
            const electron = window.require('electron');
            return !!(electron && electron.ipcRenderer);
            
        } catch (error) {
            console.log('🚫 No es entorno Electron:', error.message);
            return false;
        }
    }

    createTerminal() {
        console.log('🆕 Creando nueva terminal...');
        
        // Si no tenemos xterm, usar terminal simple
        if (typeof Terminal === 'undefined') {
            console.log('⚠️ xterm.js no disponible, usando terminal simple');
            if (!document.getElementById('simple-terminal-output')) {
                this.createSimpleTerminal();
            }
            return 1; // ID fijo para terminal simple
        }

        const terminalId = this.nextTerminalId++;
        console.log(`🆕 Creando terminal xterm con ID: ${terminalId}`);
        
        // Crear instancia de xterm
        const xterm = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#cccccc',
                cursor: '#ffffff',
                selection: '#264f78',
                black: '#000000',
                red: '#cd3131',
                green: '#0dbc79',
                yellow: '#e5e510',
                blue: '#2472c8',
                magenta: '#bc3fbc',
                cyan: '#11a8cd',
                white: '#e5e5e5',
                brightBlack: '#666666',
                brightRed: '#f14c4c',
                brightGreen: '#23d18b',
                brightYellow: '#f5f543',
                brightBlue: '#3b8eea',
                brightMagenta: '#d670d6',
                brightCyan: '#29b8db',
                brightWhite: '#e5e5e5'
            },
            cols: 80,
            rows: 24
        });

        // Crear elemento contenedor para este terminal
        const terminalElement = document.createElement('div');
        terminalElement.id = `terminal-${terminalId}`;
        terminalElement.style.cssText = `
            width: 100%;
            height: 100%;
            display: ${this.currentTerminalId === null ? 'block' : 'none'};
        `;

        const terminalsArea = document.getElementById('terminals-area');
        if (!terminalsArea) {
            console.error('❌ #terminals-area no encontrado');
            return;
        }
        terminalsArea.appendChild(terminalElement);

        // Montar xterm en el elemento
        xterm.open(terminalElement);

        // Configurar entrada de datos
        let currentLine = '';
        xterm.onData(data => {
            // Enviar datos al proceso principal
            if (this.isElectron && this.ipcRenderer) {
                if (data === '\r') {
                    // Enter presionado - ejecutar comando
                    xterm.write('\r\n');
                    this.ipcRenderer.send('terminal-input', terminalId, currentLine + '\n');
                    currentLine = '';
                } else if (data === '\u007F') {
                    // Backspace
                    if (currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                        xterm.write('\b \b');
                    }
                } else if (data === '\u0003') {
                    // Ctrl+C
                    xterm.write('^C\r\n');
                    this.ipcRenderer.send('terminal-input', terminalId, '\u0003');
                    currentLine = '';
                } else {
                    // Carácter normal
                    currentLine += data;
                    xterm.write(data);
                }
            } else {
                // Modo demo sin Electron
                if (data === '\r') {
                    xterm.write('\r\nComando demo: ' + currentLine + '\r\n');
                    xterm.write('PS> ');
                    currentLine = '';
                } else if (data === '\u007F') {
                    if (currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                        xterm.write('\b \b');
                    }
                } else {
                    currentLine += data;
                    xterm.write(data);
                }
            }
        });

        // Guardar referencia del terminal
        this.terminals.set(terminalId, {
            xterm,
            element: terminalElement,
            id: terminalId
        });

        // Establecer como terminal actual
        this.currentTerminalId = terminalId;

        // Inicializar terminal en el proceso principal
        if (this.isElectron && this.ipcRenderer) {
            this.ipcRenderer.send('create-terminal', terminalId);
        }

        // Mensaje de bienvenida
        const welcomeMsg = this.isElectron ? 
            '🐟 \x1b[1;36mSamaruC Code Terminal\x1b[0m\r\n' :
            '🐟 \x1b[1;36mSamaruC Code Terminal (Demo)\x1b[0m\r\n';
        
        xterm.write(welcomeMsg);
        xterm.write('Terminal iniciada. Escribe comandos y presiona Enter.\r\n');
        
        if (!this.isElectron) {
            xterm.write('\x1b[1;33m⚠️ Modo demo - comandos simulados\x1b[0m\r\n');
        }
        
        xterm.write('\r\nPS> ');

        console.log(`✅ Terminal ${terminalId} creada`);
        return terminalId;
    }

    clearCurrentTerminal() {
        if (this.currentTerminalId) {
            const terminal = this.terminals.get(this.currentTerminalId);
            if (terminal && terminal.xterm) {
                terminal.xterm.clear();
                terminal.xterm.write('🐟 \x1b[1;36mSamaruC Code Terminal\x1b[0m\r\n');
                terminal.xterm.write('Terminal limpia.\r\n\r\n');
            }
        }
    }

    focusCurrentTerminal() {
        if (this.currentTerminalId) {
            const terminal = this.terminals.get(this.currentTerminalId);
            if (terminal && terminal.xterm) {
                terminal.xterm.focus();
            }
        }
    }

    // Función para cambiar el tamaño del terminal cuando cambie el panel
    resizeTerminals() {
        this.terminals.forEach(terminal => {
            if (terminal.xterm) {
                terminal.xterm.fit();
            }
        });
    }

    createSimpleTerminal() {
        console.log('🔧 Creando terminal simple sin xterm...');
        
        const terminalsArea = document.getElementById('terminals-area');
        if (!terminalsArea) {
            console.error('❌ #terminals-area no encontrado para terminal simple');
            return;
        }

        // Limpiar contenido existente
        terminalsArea.innerHTML = '';

        // Crear estructura del terminal simple
        const terminalContainer = document.createElement('div');
        terminalContainer.className = 'simple-terminal-container';
        terminalContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #1e1e1e;
            color: #ffffff;
            font-family: 'Consolas', 'Monaco', monospace;
        `;

        // Crear área de salida
        const outputArea = document.createElement('div');
        outputArea.id = 'simple-terminal-output';
        outputArea.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px;
            background: #1e1e1e;
            color: #cccccc;
            font-size: 14px;
            line-height: 1.4;
            white-space: pre-wrap;
            border: none;
            margin: 0;
        `;

        // Crear área de entrada
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex;
            align-items: center;
            background: #252526;
            border-top: 1px solid #3e3e42;
            padding: 4px 8px;
            min-height: 32px;
        `;

        const prompt = document.createElement('span');
        prompt.textContent = 'PS> ';
        prompt.style.cssText = `
            color: #569cd6;
            margin-right: 4px;
            font-weight: bold;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'simple-terminal-input';
        input.placeholder = 'Escribe comandos aquí...';
        input.style.cssText = `
            flex: 1;
            background: transparent;
            border: none;
            color: #cccccc;
            font-family: inherit;
            font-size: 14px;
            outline: none;
            padding: 4px;
        `;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleSimpleTerminalCommand(input.value);
                input.value = '';
            }
        });

        inputContainer.appendChild(prompt);
        inputContainer.appendChild(input);
        terminalContainer.appendChild(outputArea);
        terminalContainer.appendChild(inputContainer);
        terminalsArea.appendChild(terminalContainer);

        // Mensaje de bienvenida
        this.addSimpleTerminalOutput('🐟 SamaruC Code Terminal (Modo Simple)\r\n');
        this.addSimpleTerminalOutput('Terminal iniciada. Escribe comandos y presiona Enter.\r\n');
        this.addSimpleTerminalOutput('Ejemplos: dir, cd .., gcc programa.c\r\n\r\n');

        // Dar foco al input
        setTimeout(() => {
            input.focus();
        }, 100);

        console.log('✅ Terminal simple creada');
        return 1; // ID fijo para terminal simple
    }

    addSimpleTerminalOutput(text) {
        const outputArea = document.getElementById('simple-terminal-output');
        if (outputArea) {
            outputArea.textContent += text;
            outputArea.scrollTop = outputArea.scrollHeight;
        }
    }

    handleSimpleTerminalCommand(command) {
        const terminalId = 1; // ID fijo para terminal simple
        
        // Mostrar comando en la salida
        this.addSimpleTerminalOutput(`PS> ${command}\r\n`);
        
        // Enviar comando al proceso principal
        if (this.isElectron && this.ipcRenderer) {
            this.ipcRenderer.send('terminal-input', terminalId, command + '\n');
            
            // Configurar listener para la respuesta si no existe
            if (!this.simpleTerminalConfigured) {
                this.simpleTerminalConfigured = true;
                
                // Crear terminal en el proceso principal
                this.ipcRenderer.send('create-terminal', terminalId);
            }
        } else {
            // Fallback sin Electron - simulación
            this.addSimpleTerminalOutput(`Comando demo: ${command}\r\n`);
            
            // Simular algunas respuestas comunes
            if (command.toLowerCase().includes('dir') || command.toLowerCase().includes('ls')) {
                this.addSimpleTerminalOutput('archivo1.c\r\narchivo2.h\r\nmain.c\r\n');
            } else if (command.toLowerCase().includes('pwd') || command.toLowerCase().includes('cd')) {
                this.addSimpleTerminalOutput('C:\\Users\\demo\\proyecto\r\n');
            } else {
                this.addSimpleTerminalOutput('⚠️ Modo demo - comando simulado\r\n');
            }
            
            this.addSimpleTerminalOutput('\r\nPS> ');
        }
    }

    clearCurrentTerminal() {
        if (this.currentTerminalId) {
            const terminal = this.terminals.get(this.currentTerminalId);
            if (terminal && terminal.xterm) {
                terminal.xterm.clear();
                terminal.xterm.write('🐟 \x1b[1;36mSamaruC Code Terminal\x1b[0m\r\n');
                terminal.xterm.write('Terminal limpia.\r\n\r\n');
            }
        } else {
            // Terminal simple
            const outputArea = document.getElementById('simple-terminal-output');
            if (outputArea) {
                outputArea.textContent = '';
                this.addSimpleTerminalOutput('🐟 SamaruC Code Terminal (Modo Simple)\r\n');
                this.addSimpleTerminalOutput('Terminal limpia.\r\n\r\n');
            }
        }
    }

    focusCurrentTerminal() {
        if (this.currentTerminalId) {
            const terminal = this.terminals.get(this.currentTerminalId);
            if (terminal && terminal.xterm) {
                terminal.xterm.focus();
            }
        } else {
            // Terminal simple
            const input = document.getElementById('simple-terminal-input');
            if (input) {
                input.focus();
            }
        }
    }

    // Función para cambiar el tamaño del terminal cuando cambie el panel
    resizeTerminals() {
        this.terminals.forEach(terminal => {
            if (terminal.xterm) {
                terminal.xterm.fit();
            }
        });
    }
}

// Crear instancia global del terminal manager
window.terminalManager = new TerminalManager();

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalManager;
}
