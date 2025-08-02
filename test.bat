@echo off
title Test de Configuración - Bot de Discord

echo ========================================
echo    Test de Configuración del Bot
echo ========================================
echo.

REM Verificar si existe el archivo .env
if not exist ".env" (
    echo [ERROR] Archivo .env no encontrado.
    echo Por favor copia .env.example a .env y configura tus credenciales.
    pause
    exit /b 1
)

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [ERROR] Dependencias no instaladas.
    echo Por favor ejecuta install.bat primero.
    pause
    exit /b 1
)

echo [INFO] Ejecutando pruebas de configuración...
echo.

npm run test

echo.
echo ========================================
if errorlevel 1 (
    echo [ERROR] Las pruebas fallaron. Revisa la configuración.
) else (
    echo [SUCCESS] ¡Configuración válida! Puedes iniciar el bot.
)
echo ========================================

pause
