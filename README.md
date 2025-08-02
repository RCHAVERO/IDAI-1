# 🦀 Rust Profile Verifier

✅ **Estado: FUNCIONANDO** - Bot conectado como `Rustcheckbywill#7524`

Bot de Discord para verificar perfiles de jugadores de Rust con información completa de Steam y Battlemetrics.

## 🚀 Inicio Rápido

### Comando Principal: `/check <steamid>`

Un solo comando para obtener toda la información:

```
/check 76561199109581220
/check steamcommunity.com/id/example
/check https://steamcommunity.com/profiles/76561199109581220
```

## 📋 Información Proporcionada

- **🎮 Datos de Steam:**
  - Perfil del jugador
  - Horas jugadas en Rust
  - Estado de la cuenta
  - Juegos recientes

- **⚔️ Datos de Battlemetrics:**
  - Servidores donde ha jugado
  - Tiempo jugado en cada servidor
  - Nombres de usuario utilizados
  - Última actividad registrada

## 💡 Formatos de Steam ID Soportados

- `76561198000000000` (SteamID64)
- `steamcommunity.com/id/username` (URL con nombre personalizado)
- `steamcommunity.com/profiles/76561198000000000` (URL con SteamID64)

## ✨ Características

- ✅ **Un solo comando simple:** `/check`
- ✅ **Información completa:** Steam + Battlemetrics
- ✅ **Verificación automática** de perfiles
- ✅ **Embeds elegantes** con toda la información
- ✅ **Compatible** con múltiples formatos de Steam ID
- ✅ **Respuestas rápidas** con actualizaciones en tiempo real
1. Ejecuta `start.bat` o `npm start`
2. Usa `/rust <steamid>` en Discord
3. ¡Disfruta verificando perfiles!

## 📋 Configuración Inicial

Si es la primera vez que usas el bot:

1. Instala las dependencias:
```bash
npm install
```

2. Crea un archivo `.env` con las siguientes variables:
```
DISCORD_TOKEN=tu_token_de_discord
STEAM_API_KEY=tu_api_key_de_steam
```

3. Ejecuta el bot:
```bash
npm start
```

## Comandos

- `/rust <steamid>` - Obtiene información del perfil de Rust
- `/steam <steamid>` - Obtiene información básica de Steam

## Obtener API Keys

### Discord Bot Token
1. Ve a https://discord.com/developers/applications
2. Crea una nueva aplicación
3. Ve a la sección "Bot" y crea un bot
4. Copia el token

### Steam API Key
1. Ve a https://steamcommunity.com/dev/apikey
2. Registra tu dominio (puedes usar localhost para desarrollo)
3. Copia la API key
