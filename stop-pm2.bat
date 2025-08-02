@echo off
echo 🛑 Deteniendo bot de Discord...
pm2 stop rust-discord-bot
pm2 delete rust-discord-bot
echo ✅ Bot detenido completamente
pause
