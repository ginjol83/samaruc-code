// ui.js - Funciones de interfaz de usuario
// SamaruC Code - IDE para desarrollo de juegos retro

// Función para añadir líneas al output
function addOutputLine(message, type = 'info') {
    const outputContent = document.getElementById('output-content');
    if (outputContent) {
        const line = document.createElement('div');
        line.className = `output-line ${type}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        outputContent.appendChild(line);
        outputContent.scrollTop = outputContent.scrollHeight;
        
        // Mantener solo las últimas 1000 líneas
        const lines = outputContent.querySelectorAll('.output-line');
        if (lines.length > 1000) {
            for (let i = 0; i < lines.length - 1000; i++) {
                lines[i].remove();
            }
        }
    } else {
        // Fallback: usar console.log
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Función para cambiar de panel
function switchPanel(panelName) {
    console.log(`🔄 switchPanel llamado con: '${panelName}'`);
    
    // Ocultar todos los paneles
    const allPanels = document.querySelectorAll('.panel-section');
    console.log(`🔄 Ocultando ${allPanels.length} paneles...`);
    allPanels.forEach(panel => {
        panel.classList.remove('active');
        console.log(`   - Panel ${panel.id} oculto`);
    });
    
    // Desactivar todas las pestañas
    const allTabs = document.querySelectorAll('.panel-tab');
    console.log(`🔄 Desactivando ${allTabs.length} pestañas...`);
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar el panel seleccionado
    const selectedPanel = document.getElementById(`${panelName}-panel`);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
        console.log(`✅ Panel '${panelName}-panel' activado`);
    } else {
        console.error(`❌ Panel '${panelName}-panel' no encontrado`);
    }
    
    // Activar la pestaña seleccionada
    const selectedTab = document.querySelector(`[data-panel="${panelName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        console.log(`✅ Pestaña '${panelName}' activada`);
    } else {
        console.error(`❌ Pestaña con data-panel='${panelName}' no encontrada`);
    }
    
    // Acciones específicas por panel
    if (panelName === 'terminal') {
        console.log('🖥️ Panel terminal seleccionado, inicializando...');
        // Cuando se selecciona el terminal, asegurar que esté inicializado
        if (window.terminalManager) {
            console.log('✅ terminalManager disponible');
            // Si no hay terminal creada, crear una
            if (window.terminalManager.terminals.size === 0 && !document.getElementById('simple-terminal-output')) {
                console.log('🔄 Inicializando terminal al cambiar a pestaña...');
                window.terminalManager.createTerminal();
            } else {
                console.log('🔄 Terminal ya existe, dando foco...');
            }
            
            setTimeout(() => {
                window.terminalManager.focusCurrentTerminal();
            }, 100);
        } else {
            console.error('❌ terminalManager no disponible');
        }
    }
}

// Crear pestaña
function createTab(filePath) {
    const tabsContainer = document.getElementById('editor-tabs');
    const fileName = window.safePath?.basename(filePath) || filePath.split(/[\\/]/).pop();
    
    const tab = document.createElement('button');
    tab.className = 'editor-tab';
    tab.dataset.file = filePath;
    tab.innerHTML = `
        <i class="fas fa-file"></i>
        <span>${fileName}</span>
        <button class="close-btn" onclick="closeFile('${filePath}')" title="Cerrar">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    tab.addEventListener('click', (e) => {
        if (!e.target.classList.contains('close-btn') && !e.target.closest('.close-btn')) {
            if (window.switchToFile) {
                window.switchToFile(filePath);
            }
        }
    });
    
    tabsContainer.appendChild(tab);
}

// Actualizar título de pestaña
function updateTabTitle(filePath) {
    const tab = document.querySelector(`[data-file="${filePath}"]`);
    if (tab) {
        const fileName = window.safePath?.basename(filePath) || filePath.split(/[\\/]/).pop();
        const span = tab.querySelector('span');
        if (span) {
            // Marcar como modificado si es necesario
            const isModified = window.openFiles && window.openFiles.has(filePath) && window.openFiles.get(filePath).modified;
            span.textContent = isModified ? `${fileName} •` : fileName;
        }
    }
}

// Mostrar mensaje del samaruc (easter egg)
function showSamaruCMessage() {
    const messages = [
        "¡El samaruc nada feliz por tu código! 🐟",
        "Como el samaruc en las aguas del Júcar, tu código fluye con elegancia 💫",
        "¡Código tan limpio como las aguas donde nada el samaruc! ✨",
        "El samaruc aprecia tu dedicación al desarrollo retro 🎮",
        "¡Sigue así! El samaruc está orgulloso de tu progreso 🌟"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    addOutputLine(randomMessage, 'success');
    
    // Mostrar notificación visual si es posible
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SamaruC Code', {
            body: randomMessage,
            icon: './assets/samaruc-icon.svg'
        });
    }
}

// Diálogo personalizado para reemplazar prompt/confirm
function showCustomDialog(title, message, type = 'confirm', defaultValue = '') {
    return new Promise((resolve) => {
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove(); resolve(null);">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    ${type === 'prompt' ? `<input type="text" id="modal-input" value="${defaultValue}" style="width: 100%; padding: 8px; margin-top: 10px;">` : ''}
                </div>
                <div class="modal-footer">
                    ${type === 'confirm' || type === 'prompt' ? 
                        `<button class="btn btn-primary" onclick="
                            const result = ${type === 'prompt' ? 'document.getElementById(\'modal-input\').value' : 'true'};
                            this.closest('.modal').remove();
                            resolve(result);
                        ">Aceptar</button>` : ''}
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove(); resolve(${type === 'confirm' || type === 'prompt' ? 'false' : 'null'});">
                        ${type === 'alert' ? 'Cerrar' : 'Cancelar'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Enfocar input si es prompt
        if (type === 'prompt') {
            const input = document.getElementById('modal-input');
            if (input) {
                input.focus();
                input.select();
                
                // Permitir Enter para aceptar
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const result = input.value;
                        modal.remove();
                        resolve(result);
                    }
                });
            }
        }
        
        // Permitir Escape para cancelar
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                resolve(type === 'confirm' || type === 'prompt' ? false : null);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Reemplazar la función resolve en el contexto del modal
        modal.resolve = resolve;
    });
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.addOutputLine = addOutputLine;
    window.switchPanel = switchPanel;
    window.createTab = createTab;
    window.updateTabTitle = updateTabTitle;
    window.showSamaruCMessage = showSamaruCMessage;
    window.showCustomDialog = showCustomDialog;
}
