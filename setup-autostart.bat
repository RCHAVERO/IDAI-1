@echo off
echo 🔧 Configurando PM2 para inicio automático con Windows...
echo.

echo 1. Guardando configuración actual...
pm2 save

echo.
echo 2. Configurando startup automático...
pm2 startup

echo.
echo ⚠️  IMPORTANTE: 
echo Cuando aparezca un comando que empiece con "pm2 startup windows..."
echo COPIA ese comando completo y ejecutalo como ADMINISTRADOR
echo.
echo 3. Después ejecuta: pm2 save
echo.
echo ✅ Esto hará que tu bot se inicie automáticamente cuando Windows arranque
pause
