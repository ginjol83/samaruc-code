@echo off
title Retro Game IDE

echo ====================================
echo      RETRO GAME IDE
echo    IDE para Juegos Retro en C
echo ====================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org/
    echo Despues ejecuta setup.bat para configurar el proyecto
    echo.
    pause
    exit /b 1
)

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo Las dependencias no estan instaladas.
    echo Ejecutando instalacion automatica...
    echo.
    npm install
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
    echo Para compilar juegos en C necesitas instalar MinGW-w64:
    echo 1. Ve a: https://www.mingw-w64.org/
    echo 2. Descarga e instala MinGW-w64
    echo 3. Agrega la carpeta 'bin' al PATH de Windows
    echo 4. Reinicia este programa
    echo.
    echo El IDE se iniciara, pero no podras compilar hasta
    echo que instales GCC.
    echo.
    pause
)

echo Iniciando Retro Game IDE...
echo.
echo Para cerrar el IDE, cierra la ventana o presiona Ctrl+Q
echo.

REM Iniciar la aplicación
npm start
