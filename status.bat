@echo off
echo 📊 Estado del bot de Discord...
pm2 status
echo.
echo 📋 Últimos logs:
pm2 logs rust-discord-bot --lines 20
pause
