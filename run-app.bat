@echo off
echo 🐟 Iniciando SamaruC Code...
echo.
echo Directorios:
echo - Actual: %CD%
echo - Package.json existe: 
if exist package.json (echo   ✅ SI) else (echo   ❌ NO)
echo - src/main.js existe: 
if exist src\main.js (echo   ✅ SI) else (echo   ❌ NO)
echo.
echo Ejecutando Electron...
electron .
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
