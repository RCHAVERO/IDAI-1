@echo off
title Bot de Discord - Verificador de Rust

echo ========================================
echo    Iniciando Bot de Discord...
echo ========================================
echo.

REM Verificar si existe el archivo .env
if not exist ".env" (
    echo [ERROR] Archivo .env no encontrado.
    echo Por favor ejecuta install.bat primero.
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

echo [INFO] Iniciando bot...
echo [INFO] Presiona Ctrl+C para detener el bot
echo.

npm start

pause
