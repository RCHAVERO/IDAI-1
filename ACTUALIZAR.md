# 🔄 Cómo Actualizar el Bot

## 📋 Pasos para Actualizar el Bot

### Método 1: Usar restart.bat (Recomendado)
1. Haz doble clic en `restart.bat`
2. El bot se reiniciará automáticamente con todas las actualizaciones

### Método 2: Manual
1. Cierra la ventana del bot actual (Ctrl+C)
2. Haz doble clic en `start.bat`

### Método 3: Desde línea de comandos
```bash
# Detener el bot actual
taskkill /F /IM node.exe

# Reiniciar el bot
node index.js
```

## ✅ Verificar que el Bot Está Actualizado

Cuando inicies el bot, debes ver:
```
✅ Bot conectado como Rustcheckbywill#7524
ℹ️  Registrando comando /check...
✅ Comando /check registrado exitosamente
```

## 🎮 Comando Actualizado

### `/check <steamid>`
- **Función:** Verificación completa de perfil de Rust
- **Incluye:** Steam + Battlemetrics
- **Formatos:** Steam ID64, URLs de perfil, nombres personalizados

### Ejemplos:
```
/check 76561198000000000
/check steamcommunity.com/id/username  
/check https://steamcommunity.com/profiles/76561198000000000
```

## 🔧 Archivos Actualizados

- ✅ `index.js` - Comando único `/check`
- ✅ `embedUtils.js` - Embeds mejorados
- ✅ `battlemetricsAPI.js` - Integración Battlemetrics
- ✅ `steamAPI.js` - API de Steam
- ✅ `commands.js` - Registro de comandos
- ✅ `restart.bat` - Script de reinicio

## 📊 Funcionalidades Incluidas

- **Steam:**
  - Perfil del jugador
  - Horas jugadas en Rust
  - Estado de la cuenta
  - Información de juegos

- **Battlemetrics:**
  - Servidores donde ha jugado
  - Tiempo en cada servidor
  - Nombres de usuario utilizados
  - Estadísticas detalladas

---

*¡Tu bot está listo con todas las funciones actualizadas!* 🦀
