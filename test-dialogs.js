// Funciones de diálogo seguras para Electron
function safePrompt(message, defaultValue = '') {
    if (typeof prompt !== 'undefined') {
        return prompt(message, defaultValue);
    } else {
        // Fallback para entornos donde prompt no está disponible
        const result = window.prompt ? window.prompt(message, defaultValue) : defaultValue;
        return result;
    }
}

function safeConfirm(message) {
    if (typeof confirm !== 'undefined') {
        return confirm(message);
    } else {
        // Fallback para entornos donde confirm no está disponible
        return window.confirm ? window.confirm(message) : true;
    }
}

// Test básico
console.log('Testing prompt:', typeof prompt);
console.log('Testing confirm:', typeof confirm);
console.log('Testing window.prompt:', typeof window.prompt);
console.log('Testing window.confirm:', typeof window.confirm);
