// debug-monaco.js - Script para diagnosticar problemas de Monaco
console.log('🔍 Diagnóstico de Monaco Editor');

const fs = require('fs');
const path = require('path');

// Verificar archivos de Monaco
const monacoFiles = [
    'src/monaco/vs/loader.js',
    'src/monaco/vs/editor/editor.main.js',
    'src/monaco/vs/editor/editor.main.css',
    'src/monaco/vs/base/worker/workerMain.js'
];

console.log('📁 Verificando archivos de Monaco:');
monacoFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const exists = fs.existsSync(fullPath);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file} - ${exists ? 'EXISTE' : 'NO ENCONTRADO'}`);
    
    if (exists) {
        const stats = fs.statSync(fullPath);
        console.log(`   Tamaño: ${stats.size} bytes`);
    }
});

// Verificar estructura de Monaco
const monacoDir = path.join(__dirname, 'src/monaco/vs');
if (fs.existsSync(monacoDir)) {
    console.log('\n📂 Contenido de monaco/vs:');
    try {
        const contents = fs.readdirSync(monacoDir);
        contents.forEach(item => {
            console.log(`   - ${item}`);
        });
    } catch (error) {
        console.error('❌ Error leyendo directorio monaco:', error.message);
    }
} else {
    console.log('❌ Directorio monaco/vs no existe');
}

console.log('\n🏁 Diagnóstico completado');
