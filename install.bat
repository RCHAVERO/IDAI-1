@echo off
echo ========================================
echo    Bot de Discord - Verificador de Rust
echo ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js detectado correctamente.

REM Verificar si npm está disponible
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm no está disponible.
    pause
    exit /b 1
)

echo [INFO] npm detectado correctamente.
echo.

REM Instalar dependencias
echo [INFO] Instalando dependencias...
npm install

if errorlevel 1 (
    echo [ERROR] Error al instalar dependencias.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Dependencias instaladas correctamente!
echo.

REM Verificar si existe el archivo .env
if not exist ".env" (
    echo [INFO] Creando archivo de configuración...
    copy ".env.example" ".env"
    echo.
    echo [IMPORTANTE] Debes configurar tu archivo .env con:
    echo   - DISCORD_TOKEN: Token de tu bot de Discord
    echo   - STEAM_API_KEY: Clave de API de Steam
    echo.
    echo Abre el archivo .env en un editor de texto y añade tus claves.
    echo.
    echo Para obtener las claves:
    echo   Discord: https://discord.com/developers/applications
    echo   Steam: https://steamcommunity.com/dev/apikey
    echo.
) else (
    echo [INFO] Archivo .env ya existe.
)

echo ========================================
echo           Instalación completa
echo ========================================
echo.
echo Para ejecutar el bot:
echo   npm start
echo.
echo Para desarrollo con recarga automática:
echo   npm run dev
echo.
pause
