const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createTestIcon() {
    console.log('🧪 Creando icono de prueba muy visible...');
    
    const outputDir = path.join(__dirname, 'src', 'assets');
    
    // Crear un icono muy llamativo para test
    const testSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <!-- Fondo rojo brillante -->
    <rect width="256" height="256" fill="#FF0000"/>
    
    <!-- Texto grande -->
    <text x="128" y="80" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="32" font-weight="bold">TEST</text>
    <text x="128" y="120" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="24">ICON</text>
    
    <!-- Forma distintiva -->
    <circle cx="128" cy="170" r="40" fill="#FFFF00" stroke="#000000" stroke-width="4"/>
    <text x="128" y="180" text-anchor="middle" fill="#000000" font-family="Arial" font-size="20" font-weight="bold">!</text>
</svg>`;

    // Guardar SVG de prueba
    const testSvgPath = path.join(outputDir, 'test-icon.svg');
    fs.writeFileSync(testSvgPath, testSvg);
    
    try {
        // Generar PNG de prueba
        const testPngPath = path.join(outputDir, 'test-icon-256.png');
        await sharp(Buffer.from(testSvg))
            .resize(256, 256)
            .png()
            .toFile(testPngPath);
        
        console.log('✅ Icono de prueba creado:', testPngPath);
        console.log('🔄 Actualiza main.js para usar test-icon-256.png y verifica si lo ves');
        
        return testPngPath;
    } catch (error) {
        console.error('❌ Error creando icono de prueba:', error);
    }
}

createTestIcon();
