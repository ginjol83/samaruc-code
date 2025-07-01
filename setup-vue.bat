@echo off
echo ====================================
echo   Configuracion Vue.js + Electron
echo ====================================
echo.

echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Verificando npm...
npm --version
if errorlevel 1 (
    echo ERROR: npm no esta disponible
    pause
    exit /b 1
)

echo.
echo Instalando dependencias de Vue.js...
npm install vue@3.3.4 vuex@4.1.0 vue-router@4.2.4

echo.
echo Instalando Vue CLI y herramientas de desarrollo...
npm install -g @vue/cli
npm install --save-dev @vue/cli-service vue-cli-plugin-electron-builder

echo.
echo Instalando herramientas adicionales...
npm install --save-dev concurrently wait-on path-browserify

echo.
echo Verificando GCC...
gcc --version >nul 2>&1
if errorlevel 1 (
    echo ADVERTENCIA: GCC no esta instalado o no esta en el PATH
    echo Para compilar programas en C necesitas instalar MinGW-w64
    echo Descargalo desde: https://www.mingw-w64.org/
    echo.
) else (
    echo GCC encontrado correctamente
)

echo.
echo ====================================
echo   Configuracion Vue completada!
echo ====================================
echo.
echo Para iniciar en modo desarrollo: npm run dev
echo Para construir la aplicacion: npm run electron:build
echo.
pause
