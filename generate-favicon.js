const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcSvg = path.join(__dirname, 'src', 'assets', 'icon.svg');
const outputDir = path.join(__dirname, 'src', 'assets');

async function generateFavicon() {
    try {
        console.log('🎨 Generando favicon.ico desde icon.svg...');
        
        // Generar favicon.ico (16x16 y 32x32 para compatibilidad)
        const faviconPath = path.join(outputDir, 'favicon.ico');
        
        // Generar PNG de 16x16 primero
        const png16Buffer = await sharp(srcSvg)
            .resize(16, 16)
            .png()
            .toBuffer();
            
        // Generar PNG de 32x32
        const png32Buffer = await sharp(srcSvg)
            .resize(32, 32)
            .png()
            .toBuffer();
        
        // Para ICO, usaremos el de 32x32 como base
        await sharp(png32Buffer)
            .toFile(faviconPath);
            
        console.log('✅ favicon.ico generado exitosamente');
        
        // Verificar tamaños
        const stats = fs.statSync(faviconPath);
        console.log(`📊 Tamaño del archivo favicon.ico: ${stats.size} bytes`);
        
    } catch (error) {
        console.error('❌ Error generando favicon:', error);
    }
}

generateFavicon();
