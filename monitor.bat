@echo off
:monitor
cls
echo ═══════════════════════════════════════════════════════════════
echo                    🤖 MONITOR DEL BOT DE DISCORD
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📊 Estado actual:
pm2 status
echo.
echo 📋 Últimos logs (últimas 10 líneas):
echo ─────────────────────────────────────────────────────────────
pm2 logs rust-discord-bot --lines 10 --nostream
echo ─────────────────────────────────────────────────────────────
echo.
echo 💾 Uso de memoria:
pm2 monit --no-daemon
echo.
echo 🔄 Actualizando en 30 segundos... (Ctrl+C para salir)
timeout /t 30 /nobreak >nul
goto monitor
