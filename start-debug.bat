@echo off
echo Iniciando Retro Game IDE (modo depuración)...
cd /d "%~dp0"

:: Suprimir errores de registro de Windows
set ELECTRON_ENABLE_LOGGING=0
set ELECTRON_DISABLE_SECURITY_WARNINGS=true

:: Iniciar con modo desarrollador
npm start -- --dev

pause