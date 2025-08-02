module.exports = {
    // IDs de juegos en Steam
    GAMES: {
        RUST: '252490',
        CSGO: '730',
        DOTA2: '570',
        TF2: '440'
    },

    // APIs
    APIS: {
        STEAM_BASE: 'http://api.steampowered.com',
        BATTLEMETRICS_BASE: 'https://api.battlemetrics.com',
        RUST_GAME_ID: '252490'
    },

    // Colores para embeds
    COLORS: {
        RUST: 0xCE422B,
        STEAM: 0x1B2838,
        BATTLEMETRICS: 0x2F3136,
        ERROR: 0xFF0000,
        SUCCESS: 0x00FF00,
        INFO: 0x0099FF,
        WARNING: 0xFFAA00
    },

    // Límites de API
    LIMITS: {
        MAX_RESULTS: 10,
        CACHE_DURATION: 300000, // 5 minutos en ms
        RATE_LIMIT_DELAY: 1000, // 1 segundo entre llamadas
        MAX_SERVERS_DISPLAY: 5 // Máximo servidores a mostrar
    },

    // Mensajes de error comunes
    MESSAGES: {
        INVALID_STEAMID: '❌ Steam ID inválido. Por favor proporciona un Steam ID64 válido o una URL de perfil.',
        PROFILE_NOT_FOUND: '❌ No se pudo encontrar el perfil de Steam con ese ID.',
        PRIVATE_PROFILE: '❌ Este perfil es privado y no se puede obtener información.',
        GAME_NOT_OWNED: '❌ Este usuario no tiene Rust en su biblioteca de Steam.',
        API_ERROR: '❌ Error al conectar con la API de Steam. Inténtalo más tarde.',
        BATTLEMETRICS_ERROR: '❌ Error al conectar con Battlemetrics. Inténtalo más tarde.',
        NO_BATTLEMETRICS_DATA: '❌ No se encontraron datos en Battlemetrics para este jugador.',
        INTERNAL_ERROR: '❌ Ocurrió un error interno. Inténtalo de nuevo más tarde.',
        MISSING_PERMISSIONS: '❌ No tienes permisos para usar este comando.',
        COOLDOWN: '⏰ Espera un momento antes de usar este comando nuevamente.'
    },

    // URLs útiles
    URLS: {
        STEAM_PROFILE: 'https://steamcommunity.com/profiles/',
        STEAM_GAME: 'https://store.steampowered.com/app/',
        RUST_TRACKER: 'https://rust-stats.com/user/',
        BATTLEMETRICS_PLAYER: 'https://www.battlemetrics.com/players/'
    }
};
