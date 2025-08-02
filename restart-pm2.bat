@echo off
echo 🔄 Reiniciando bot de Discord...
pm2 restart rust-discord-bot
echo ✅ Bot reiniciado!
pm2 status
pause
