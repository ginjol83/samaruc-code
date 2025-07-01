@echo off
echo ===============================================
echo      SAMARUC CODE - PRUEBA DE ABRIR ARCHIVOS
echo ===============================================
echo.
echo Iniciando Samaruc Code con configuración optimizada...
echo.

cd /d "%~dp0"

:: Variables para suprimir warnings
set ELECTRON_ENABLE_LOGGING=0
set ELECTRON_DISABLE_SECURITY_WARNINGS=true
set NODE_ENV=development

:: Verificar si existe el archivo package.json
if not exist package.json (
    echo ERROR: package.json no encontrado
    echo Asegurate de estar en el directorio correcto
    pause
    exit /b 1
)

:: Verificar si existe node_modules
if not exist node_modules (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
) else (
    echo Verificando dependencias...
    if not exist "node_modules\electron" (
        echo Electron no encontrado, reinstalando dependencias...
        rmdir /s /q node_modules
        npm install
        if errorlevel 1 (
            echo ERROR: No se pudieron instalar las dependencias
            pause
            exit /b 1
        )
    )
)

echo.
echo INSTRUCCIONES:
echo 1. Se abrira el IDE
echo 2. Presiona F12 para abrir DevTools
echo 3. Haz clic en "Abrir Archivo" en la barra de herramientas
echo 4. Selecciona "test-file.c"
echo 5. Observa los logs en la consola
echo.
echo Si el boton no funciona, prueba en la consola:
echo   debugOpenFiles()
echo   testOpenFile()
echo.

:: Iniciar con modo desarrollador
npm start -- --dev

echo.
echo IDE cerrado.
pause
