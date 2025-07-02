// update-icons-from-image.js - Actualizar iconos desde imagen personalizada
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = path.join(__dirname, 'src', 'assets', '2 jul 2025, 18_55_47.png');
const outputDir = path.join(__dirname, 'src', 'assets');

// Tamaños necesarios para Electron
const ICON_SIZES = [16, 32, 48, 64, 128, 256, 512];

async function updateIconsFromImage() {
    console.log('🎨 Actualizando iconos desde imagen personalizada...');
    console.log('📂 Imagen fuente:', sourceImage);
    
    try {
        // Verificar que la imagen fuente existe
        if (!fs.existsSync(sourceImage)) {
            throw new Error('No se encontró la imagen fuente');
        }
        
        // Obtener información de la imagen
        const metadata = await sharp(sourceImage).metadata();
        console.log(`📊 Imagen original: ${metadata.width}x${metadata.height}, formato: ${metadata.format}`);
        
        // 1. Crear el SVG principal (convertir PNG a SVG embebido)
        console.log('🔄 Generando icon.svg...');
        const imageBuffer = fs.readFileSync(sourceImage);
        const base64Image = imageBuffer.toString('base64');
        
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Imagen personalizada embebida -->
    <image x="0" y="0" width="512" height="512" href="data:image/png;base64,${base64Image}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
        
        const iconSvgPath = path.join(outputDir, 'icon.svg');
        fs.writeFileSync(iconSvgPath, svgContent);
        console.log('✅ icon.svg creado');
        
        // 2. Generar todos los tamaños PNG
        console.log('📏 Generando iconos PNG...');
        for (const size of ICON_SIZES) {
            const outputPath = path.join(outputDir, `icon-${size}.png`);
            
            await sharp(sourceImage)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 } // Fondo transparente
                })
                .png()
                .toFile(outputPath);
                
            console.log(`✅ icon-${size}.png creado`);
        }
        
        // 3. Crear archivo ICO para Windows
        console.log('🪟 Generando icon.ico...');
        const icoPath = path.join(outputDir, 'icon.ico');
        
        // Para ICO, usar el tamaño 256x256
        await sharp(sourceImage)
            .resize(256, 256, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(icoPath);
            
        console.log('✅ icon.ico creado');
        
        // 4. Crear favicon
        console.log('🌐 Generando favicons...');
        
        // favicon.svg (versión pequeña)
        const faviconSvgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <image x="0" y="0" width="32" height="32" href="data:image/png;base64,${base64Image}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
        
        const faviconSvgPath = path.join(outputDir, 'favicon.svg');
        fs.writeFileSync(faviconSvgPath, faviconSvgContent);
        console.log('✅ favicon.svg creado');
        
        // favicon.ico
        const faviconIcoPath = path.join(outputDir, 'favicon.ico');
        await sharp(sourceImage)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(faviconIcoPath);
            
        console.log('✅ favicon.ico creado');
        
        // 5. Resumen
        console.log('\n🎉 ¡Iconos actualizados exitosamente!');
        console.log('📁 Archivos generados:');
        console.log('   - icon.svg (imagen embebida)');
        console.log('   - icon-16.png → icon-512.png (7 tamaños)');
        console.log('   - icon.ico (Windows)');
        console.log('   - favicon.svg + favicon.ico (navegador)');
        console.log('\n🚀 Ejecuta "npm start" para ver los cambios');
        
        // Verificar tamaños de archivos
        const stats = fs.statSync(icoPath);
        console.log(`📊 Tamaño del icon.ico: ${stats.size} bytes`);
        
    } catch (error) {
        console.error('❌ Error actualizando iconos:', error.message);
        process.exit(1);
    }
}

updateIconsFromImage();
