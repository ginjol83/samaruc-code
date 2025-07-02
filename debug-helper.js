#!/usr/bin/env node
// debug-helper.js - Utilidad para debugging fácil

const { spawn } = require('child_process');
const os = require('os');

console.log('🐛 SamaruC Code Debug Helper');
console.log('============================\n');

const args = process.argv.slice(2);
const debugType = args[0] || 'basic';

const configs = {
  basic: {
    desc: 'Debug básico con DevTools',
    cmd: 'electron',
    args: ['.', '--dev']
  },
  main: {
    desc: 'Debug Main Process (puerto 9229)',
    cmd: 'electron',
    args: ['.', '--inspect=9229', '--dev']
  },
  renderer: {
    desc: 'Debug Renderer Process (puerto 9222)', 
    cmd: 'electron',
    args: ['.', '--remote-debugging-port=9222', '--dev']
  },
  full: {
    desc: 'Debug completo (Main + Renderer)',
    cmd: 'electron', 
    args: ['.', '--inspect=9229', '--remote-debugging-port=9222', '--dev']
  }
};

if (!configs[debugType]) {
  console.log('❌ Tipo de debug no válido\n');
  console.log('Tipos disponibles:');
  Object.keys(configs).forEach(key => {
    console.log(`  ${key}: ${configs[key].desc}`);
  });
  console.log('\nUso: node debug-helper.js [tipo]');
  console.log('Ejemplo: node debug-helper.js main');
  process.exit(1);
}

const config = configs[debugType];
console.log(`🚀 Iniciando: ${config.desc}`);

// Configurar entorno
process.env.NODE_ENV = 'development';

const electronProcess = spawn(config.cmd, config.args, {
  stdio: 'inherit',
  env: process.env
});

electronProcess.on('close', (code) => {
  console.log(`\n🏁 Debug terminado con código: ${code}`);
});

electronProcess.on('error', (err) => {
  console.error('❌ Error iniciando debug:', err.message);
});

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando debug...');
  electronProcess.kill('SIGINT');
});

console.log('\n📋 Puertos de debug:');
if (debugType === 'main' || debugType === 'full') {
  console.log('  Main Process: http://localhost:9229');
}
if (debugType === 'renderer' || debugType === 'full') {
  console.log('  Renderer Process: http://localhost:9222');
}
console.log('\n💡 Presiona Ctrl+C para cerrar\n');
