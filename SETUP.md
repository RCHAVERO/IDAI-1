# Guía de Configuración - Bot de Discord para Rust

## 📋 Requisitos Previos

1. **Node.js** (versión 16 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica la instalación: `node --version`

2. **npm** (incluido con Node.js)
   - Verifica la instalación: `npm --version`

## 🔧 Configuración del Bot de Discord

### Paso 1: Crear una Aplicación de Discord

1. Ve a https://discord.com/developers/applications
2. Haz clic en "New Application"
3. Dale un nombre a tu aplicación (ej: "Rust Verificator")
4. Ve a la sección "Bot" en el menú izquierdo
5. Haz clic en "Add Bot"
6. En "Token", haz clic en "Copy" para copiar el token
7. **IMPORTANTE**: Mantén este token en secreto

### Paso 2: Configurar Permisos del Bot

En la sección "Bot":

#### ⚠️ IMPORTANTE - Configuración de Intents:
En "Privileged Gateway Intents":
- ❌ **NO** habilites "Presence Intent"
- ❌ **NO** habilites "Server Members Intent"
- ❌ **NO** habilites "Message Content Intent"

**Deja TODOS los intents privilegiados DESHABILITADOS** para evitar el error "Used disallowed intents".

#### Otras configuraciones:
1. Activa las siguientes opciones si lo deseas:
   - ✅ Public Bot (si quieres que otros puedan invitarlo)

### Paso 3: Invitar el Bot a tu Servidor

1. Ve a la sección "OAuth2" > "URL Generator"
2. En "Scopes", selecciona:
   - ✅ bot
   - ✅ applications.commands
3. En "Bot Permissions", selecciona:
   - ✅ Send Messages
   - ✅ Use Slash Commands
   - ✅ Embed Links
   - ✅ Read Message History
4. Copia la URL generada y ábrela en tu navegador
5. Selecciona tu servidor y autoriza el bot

## 🔑 Configuración de Steam API

### Obtener Steam API Key

1. Ve a https://steamcommunity.com/dev/apikey
2. Inicia sesión con tu cuenta de Steam
3. En "Domain Name", puedes poner "localhost" para desarrollo
4. Acepta los términos y obtén tu API Key
5. **IMPORTANTE**: Mantén esta clave en secreto

## ⚙️ Configuración del Proyecto

### Paso 1: Configurar Variables de Entorno

Edita el archivo `.env` y reemplaza los valores:

```env
# Token del bot de Discord (requerido)
DISCORD_TOKEN=tu_token_de_discord_aqui

# Clave de API de Steam (requerido)
STEAM_API_KEY=tu_steam_api_key_aqui

# ID del servidor de Discord (opcional)
GUILD_ID=tu_server_id_aqui
```

### Paso 2: Instalar Dependencias

Ejecuta el archivo `install.bat` o manualmente:

```bash
npm install
```

### Paso 3: Iniciar el Bot

Ejecuta el archivo `start.bat` o manualmente:

```bash
npm start
```

## 🎮 Comandos Disponibles

Una vez que el bot esté en línea, podrás usar estos comandos:

- `/rust <steamid>` - Información básica de Rust
- `/steam <steamid>` - Información completa de Steam  
- `/ruststats <steamid>` - Estadísticas avanzadas de Rust
- `/help` - Muestra la ayuda

## 📝 Formatos de Steam ID Aceptados

El bot acepta varios formatos de Steam ID:

1. **Steam ID64**: `76561198000000000`
2. **URL completa**: `https://steamcommunity.com/profiles/76561198000000000`
3. **URL personalizada**: `https://steamcommunity.com/id/nombredeusuario`
4. **Solo el nombre**: `nombredeusuario`

## 🔍 Información que Muestra

### Comando /rust:
- Nombre del jugador en Steam
- Horas totales jugadas en Rust
- Horas jugadas en las últimas 2 semanas
- Estado del perfil (público/privado)
- Fecha de creación de la cuenta
- Nivel de experiencia basado en horas

### Comando /steam:
- Información general del perfil
- Total de juegos en la biblioteca
- Juegos jugados recientemente
- Estado actual del jugador
- País de origen

### Comando /ruststats:
- Todo lo del comando /rust
- Información de logros desbloqueados
- Estadísticas adicionales (si están disponibles)

## ⚠️ Limitaciones

1. **Perfiles Privados**: No se puede obtener información de juegos de perfiles privados
2. **Rate Limiting**: Steam API tiene límites de velocidad, el bot incluye cache para reducir llamadas
3. **Disponibilidad**: Depende de la disponibilidad de las APIs de Discord y Steam

## 🐛 Solución de Problemas

### El bot no se conecta:
- Verifica que el token de Discord sea correcto
- Asegúrate de que no haya espacios extra en el archivo .env

### No se obtiene información de Steam:
- Verifica que la Steam API Key sea correcta
- Verifica que el perfil de Steam sea público
- Comprueba que el usuario tenga Rust en su biblioteca

### Errores de permisos:
- Asegúrate de que el bot tenga los permisos necesarios en el servidor
- Verifica que los slash commands estén habilitados

## 📊 Logs

El bot genera logs automáticamente en la carpeta `logs/`:
- Comandos ejecutados
- Errores de API
- Información de depuración

## 🔒 Seguridad

- **NUNCA** compartas tu token de Discord o Steam API Key
- Mantén el archivo `.env` en privado
- Usa permisos mínimos necesarios para el bot

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en la carpeta `logs/`
2. Verifica la configuración del archivo `.env`
3. Asegúrate de que todas las dependencias estén instaladas

¡Tu bot debería estar funcionando correctamente ahora! 🎉
