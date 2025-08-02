@echo off
echo 🚀 Preparando bot para hosting en la nube...
echo.

echo 📦 Creando ZIP para subir a Render/Railway...
echo.

echo 📂 Archivos incluidos:
echo ✅ index.js (bot principal)
echo ✅ steamAPI.js
echo ✅ battlemetricsAPI.js  
echo ✅ battlemetrics-scraper.js
echo ✅ embedUtils.js
echo ✅ commands.js
echo ✅ config.js
echo ✅ logger.js
echo ✅ package.json
echo.

echo ❌ Archivos excluidos:
echo ❌ .env (variables sensibles)
echo ❌ node_modules (se instalan automáticamente)
echo ❌ logs y archivos temporales
echo.

echo 💡 NEXT STEPS:
echo 1. Ve a railway.app o render.com
echo 2. Sube este proyecto
echo 3. Configura las variables de entorno:
echo    - DISCORD_TOKEN
echo    - STEAM_API_KEY  
echo    - CLIENT_ID
echo 4. ✅ Bot online 24/7!
echo.

echo 🔄 Deteniendo PM2 local...
pm2 stop rust-discord-bot 2>nul
pm2 delete rust-discord-bot 2>nul

echo.
echo ✅ Listo para hosting en la nube!
pause
