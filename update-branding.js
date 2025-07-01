#!/usr/bin/env node

/**
 * Script para actualizar todas las referencias de "Retro Game IDE" a "Samaruc Code"
 * Ejecutar con: node update-branding.js
 */

const fs = require('fs');
const path = require('path');

const replacements = [
    {
        from: /Retro Game IDE/g,
        to: 'Samaruc Code'
    },
    {
        from: /retro-game-ide/g,
        to: 'samaruc-code'
    },
    {
        from: /fa-gamepad/g,
        to: 'fa-fish'
    },
    {
        from: /🎮/g,
        to: '🐟'
    }
];

const filesToUpdate = [
    'src/index.html',
    'src/renderer.js',
    'src/main.js',
    'src/styles.css',
    'test-browser.html',
    'test-complete.bat',
    'test-open.bat',
    'README.md',
    'package.json'
];

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    replacements.forEach(({ from, to }) => {
        if (from.test(content)) {
            content = content.replace(from, to);
            updated = true;
        }
    });

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Actualizado: ${filePath}`);
    } else {
        console.log(`➖ Sin cambios: ${filePath}`);
    }
}

console.log('🐟 Actualizando branding a Samaruc Code...\n');

filesToUpdate.forEach(updateFile);

console.log('\n🎯 Actualización completada!');
console.log('🌊 Samaruc Code está listo para nadar!');
