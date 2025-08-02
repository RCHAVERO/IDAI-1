@echo off
echo 🔄 Reiniciando Bot de Discord...
echo.

:: Detener procesos existentes de Node.js
echo ⏹️ Deteniendo procesos anteriores...
taskkill /F /IM node.exe >nul 2>&1

:: Esperar un momento
timeout /t 2 /nobreak >nul

:: Iniciar el bot
echo 🚀 Iniciando bot actualizado...
echo.
node index.js

pause
