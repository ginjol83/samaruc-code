@echo off
echo.
echo ===============================================
echo                SAMARUC CODE
echo      IDE para desarrollo de juegos retro
echo ===============================================
echo.
echo El samaruc es un pez endemico de Valencia.
echo Como este pez unico, Samaruc Code es un IDE
echo unico y elegante para el desarrollo retro.
echo.
echo CARACTERISTICAS:
echo  - Editor Monaco con resaltado de sintaxis
echo  - Abrir archivos con drag y drop
echo  - Archivos recientes y atajos de teclado
echo  - Plantillas de juegos retro
echo  - Interfaz moderna y elegante
echo.
echo INICIANDO SAMARUC CODE...
echo.

cd /d "%~dp0"

:: Configuración de entorno
set ELECTRON_ENABLE_LOGGING=0
set ELECTRON_DISABLE_SECURITY_WARNINGS=true
set NODE_ENV=development

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo Error instalando dependencias
        pause
        exit /b 1
    )
)

echo.
echo Nadando hacia el IDE...
npm start

if errorlevel 1 (
    echo.
    echo Error iniciando Samaruc Code
    echo.
    echo SOLUCIONES:
    echo 1. Verificar que Node.js esta instalado
    echo 2. Ejecutar: npm install
    echo 3. Verificar que no hay otros procesos usando Electron
    echo.
    pause
)
