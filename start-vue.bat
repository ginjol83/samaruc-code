@echo off
title Retro Game IDE - Vue.js Edition

echo ====================================
echo   RETRO GAME IDE - VUE.JS EDITION
echo    IDE para Juegos Retro en C
echo ====================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org/
    echo Despues ejecuta setup-vue.bat para configurar el proyecto
    echo.
    pause
    exit /b 1
)

REM Verificar si Vue CLI está instalado
vue --version >nul 2>&1
if errorlevel 1 (
    echo Vue CLI no esta instalado. Instalando...
    npm install -g @vue/cli
)

REM Verificar si las dependencias están instaladas
if not exist "node_modules\vue" (
    echo Las dependencias de Vue no estan instaladas.
    echo Ejecutando instalacion automatica...
    echo.
    call setup-vue.bat
    echo.
)

REM Verificar GCC
gcc --version >nul 2>&1
if errorlevel 1 (
    echo ====================================
    echo          ADVERTENCIA
    echo ====================================
    echo GCC no esta instalado o no esta en el PATH
    echo.
    echo Para compilar juegos en C necesitas instalar MinGW-w64
    echo El IDE funcionara pero no podras compilar.
    echo.
    pause
)

echo Iniciando Retro Game IDE (Vue.js)...
echo.
echo Servidor de desarrollo iniciandose en http://localhost:8080
echo El IDE se abrira automaticamente cuando este listo.
echo.
echo Para cerrar: Cierra la ventana de Electron o presiona Ctrl+C aqui
echo.

REM Iniciar en modo desarrollo (Vue dev server + Electron)
npm run dev
