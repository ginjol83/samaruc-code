// refresh-app.js - Script para forzar actualización de iconos
console.log('🔄 Refrescando aplicación y iconos...');

const { exec } = require('child_process');
const path = require('path');

// 1. Matar cualquier proceso de Electron existente
console.log('❌ Cerrando procesos Electron existentes...');
exec('taskkill /F /IM electron.exe', (error) => {
    if (error) {
        console.log('ℹ️  No hay procesos Electron ejecutándose');
    } else {
        console.log('✅ Procesos Electron cerrados');
    }
    
    // 2. Esperar un momento y reiniciar
    setTimeout(() => {
        console.log('🚀 Reiniciando aplicación...');
        exec('npm start', {cwd: __dirname}, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Error reiniciando:', error);
                return;
            }
            console.log('📱 Aplicación reiniciada');
        });
    }, 2000);
});

console.log('💡 Consejos para ver el icono:');
console.log('  1. Mira la barra de tareas de Windows');
console.log('  2. Alt+Tab para ver el icono en el selector');
console.log('  3. Si no se ve, reinicia Windows Explorer:');
console.log('     - Ctrl+Shift+Esc → Windows Explorer → Reiniciar');
