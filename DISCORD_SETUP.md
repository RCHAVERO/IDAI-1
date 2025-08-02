# 🔧 Configuración del Bot en Discord

## Paso a Paso para Configurar tu Bot

### 1. Crear la Aplicación en Discord

1. Ve a https://discord.com/developers/applications
2. Haz clic en **"New Application"**
3. Dale un nombre a tu bot (ej: "Rust Verificator")
4. Haz clic en **"Create"**

### 2. Configurar el Bot

1. En el menú izquierdo, haz clic en **"Bot"**
2. Haz clic en **"Add Bot"**
3. Copia el **Token** (lo necesitarás para el archivo .env)

#### ⚠️ Configuración de Intents (MUY IMPORTANTE)

En la sección **"Privileged Gateway Intents"**:
- ❌ **NO** habilites "Presence Intent"
- ❌ **NO** habilites "Server Members Intent"  
- ❌ **NO** habilites "Message Content Intent"

**IMPORTANTE**: Deja todos los intents privilegiados DESHABILITADOS para evitar el error "Used disallowed intents".

### 3. Generar URL de Invitación

1. Ve a **"OAuth2"** > **"URL Generator"**
2. En **"Scopes"**, selecciona:
   - ✅ `bot`
   - ✅ `applications.commands`

3. En **"Bot Permissions"**, selecciona:
   - ✅ `Send Messages`
   - ✅ `Use Slash Commands`
   - ✅ `Embed Links`
   - ✅ `Read Message History`

4. Copia la URL generada y ábrela en tu navegador
5. Selecciona tu servidor y autoriza el bot

### 4. Configurar el archivo .env

Edita tu archivo `.env` con el token copiado:

```env
DISCORD_TOKEN=tu_token_aqui
STEAM_API_KEY=tu_steam_api_key_aqui
```

### 5. Verificar Configuración

Ejecuta el test para verificar que todo esté configurado correctamente:

```bash
npm run test
```

¡Listo! Tu bot debería conectarse sin problemas.
