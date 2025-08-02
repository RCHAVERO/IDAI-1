@echo off
echo 🚀 Iniciando bot de Discord con PM2...
pm2 start ecosystem.config.json
echo.
echo ✅ Bot iniciado! 
echo 📊 Para ver el estado: pm2 status
echo 📋 Para ver logs: pm2 logs rust-discord-bot
echo 🔄 Para reiniciar: pm2 restart rust-discord-bot
echo 🛑 Para detener: pm2 stop rust-discord-bot
pause
