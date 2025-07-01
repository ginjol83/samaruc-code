@echo off
echo ====================================
echo   Configuracion de Retro Game IDE
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
echo Instalando dependencias...
npm install

if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)

echo.
echo ====================================
echo   Configuracion completada!
echo ====================================
echo.
echo Para iniciar el IDE ejecuta: npm start
echo.
pause
