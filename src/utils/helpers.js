// helpers.js - Funciones auxiliares y utilitarios
// Samaruc Code - IDE para desarrollo de juegos retro

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
        document.title = `Samaruc Code - ${safePath.basename(filePath)}`;
    } else {
        document.title = 'Samaruc Code';
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

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.getIpcRenderer = getIpcRenderer;
    window.getFs = getFs;
    window.safePath = safePath;
    window.isBinaryFile = isBinaryFile;
    window.formatFileSize = formatFileSize;
    window.updateWindowTitle = updateWindowTitle;
    window.getLanguageFromFile = getLanguageFromFile;
}
