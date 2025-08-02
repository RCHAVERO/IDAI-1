require('dotenv').config();
const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SteamAPI = require('./steamAPI');
const BattlemetricsAPI = require('./battlemetricsAPI');
const BattlemetricsScraper = require('./battlemetrics-scraper');
const EmbedUtils = require('./embedUtils');
const config = require('./config');
const logger = require('./logger');

// Crear el cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

// Colección para comandos
client.commands = new Collection();

// Inicializar APIs
const steamAPI = new SteamAPI(process.env.STEAM_API_KEY);
const battlemetricsAPI = new BattlemetricsAPI();
const battlemetricsScraper = new BattlemetricsScraper();

// Cache simple para evitar spam de API
const cache = new Map();

// Función para verificar si hay datos en cache
function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < config.LIMITS.CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

// Función para guardar en cache
function setCachedData(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Evento cuando el bot se conecta
client.once('ready', async () => {
    logger.success(`Bot conectado como ${client.user.tag}`);
    
    // Registrar comando slash
    const commands = [
        new SlashCommandBuilder()
            .setName('check')
            .setDescription('Verificar perfil completo de Rust (Steam + Battlemetrics)')
            .addStringOption(option =>
                option.setName('steamid')
                    .setDescription('Steam ID64, URL del perfil de Steam o nombre personalizado')
                    .setRequired(true)
            )
    ];

    try {
        logger.info('Registrando comando /check...');
        await client.application.commands.set(commands);
        logger.success('Comando /check registrado exitosamente');
    } catch (error) {
        logger.error('Error registrando comando:', error);
    }
});

// Comando principal /check
async function handleCheckCommand(interaction) {
    const steamIdInput = interaction.options.getString('steamid');
    logger.command(`${interaction.user.tag} (${interaction.user.id})`, 'check', steamIdInput);
    
    if (!steamIdInput) {
        logger.warn('Steam ID no proporcionado');
        return interaction.reply({
            content: '❌ **Uso correcto:** `/check <steamid>`\n\n**Ejemplos:**\n• `/check 76561198000000000`\n• `/check steamcommunity.com/id/username`',
            flags: 64
        });
    }

    logger.debug(`Procesando Steam ID: ${steamIdInput}`);
    
    try {
        // Responder inmediatamente
        await interaction.reply({
            content: `🔍 **Verificando perfil de Rust:** \`${steamIdInput}\`\n\n⏳ Obteniendo datos de Steam y Battlemetrics...`
        });

        // Resolver Steam ID
        const steamId = await steamAPI.resolveSteamId(steamIdInput);
        if (!steamId) {
            return interaction.editReply({
                content: '❌ Steam ID inválido. Usa un Steam ID64, URL de perfil o nombre personalizado.'
            });
        }

        await interaction.editReply({
            content: `🔍 **Verificando perfil de Rust:** \`${steamId}\`\n\n📊 Obteniendo información de Steam...`
        });

        // Obtener información de Steam (incluyendo baneos)
        const [profile, games, banInfo] = await Promise.all([
            steamAPI.getPlayerSummary(steamId),
            steamAPI.getOwnedGames(steamId),
            steamAPI.getPlayerBans(steamId)
        ]);

        if (!profile) {
            return interaction.editReply({
                content: '❌ No se pudo encontrar el perfil de Steam.'
            });
        }

        if (profile.communityvisibilitystate !== 3) {
            return interaction.editReply({
                content: '❌ Este perfil es privado. No se puede obtener información de juegos.'
            });
        }

        const rustGame = games.find(game => game.appid == config.GAMES.RUST);
        if (!rustGame) {
            return interaction.editReply({
                content: '❌ Este usuario no tiene Rust en su biblioteca de Steam.'
            });
        }

        await interaction.editReply({
            content: `🔍 **Verificando perfil de Rust:** \`${steamId}\`\n\n⚔️ Obteniendo datos de Battlemetrics...`
        });

        // Obtener información de Battlemetrics con múltiples métodos
        let battlemetricsData = await battlemetricsAPI.getCompletePlayerInfo(steamId);
        
        // Si la API no funciona, intentar web scraping
        if (!battlemetricsData) {
            await interaction.editReply({
                content: `🔍 **Verificando perfil de Rust:** \`${steamId}\`\n\n🕷️ Intentando método alternativo...`
            });
            
            battlemetricsData = await battlemetricsScraper.searchPlayerBySteamID(steamId);
            
            // Si el scraping tampoco funciona, crear datos estimados
            if (!battlemetricsData) {
                await interaction.editReply({
                    content: `🔍 **Verificando perfil de Rust:** \`${steamId}\`\n\n📊 Generando análisis estimado...`
                });
                
                battlemetricsData = await battlemetricsScraper.createEstimatedData(steamId, rustGame);
            }
        }

        // Crear embed con toda la información (incluyendo baneos)
        const formattedBans = steamAPI.formatBanInfo(banInfo);
        const embed = EmbedUtils.createAdvancedRustEmbed(profile, rustGame, battlemetricsData, formattedBans);
        embed.setURL(`${config.URLS.STEAM_PROFILE}${steamId}`);

        await interaction.editReply({
            content: null,
            embeds: [embed]
        });
        
        logger.success(`Información completa de Rust obtenida para: ${profile.personaname} (${steamId})`);
        if (battlemetricsData?.estimated) {
            logger.info('Datos de Battlemetrics estimados utilizados');
        } else if (battlemetricsData?.found) {
            logger.info('Datos de Battlemetrics obtenidos via scraping');
        } else {
            logger.warn('No se pudieron obtener datos de Battlemetrics');
        }
    } catch (error) {
        logger.error('Error en comando check:', error);
        
        try {
            await interaction.editReply({
                content: '❌ Error obteniendo la información. Inténtalo más tarde.'
            });
        } catch (editError) {
            logger.error('Error editando respuesta:', editError);
        }
    }
}

// Manejar interacciones de comandos slash
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    logger.info(`Comando recibido: ${commandName} por ${interaction.user.tag}`);

    try {
        if (commandName === 'check') {
            await handleCheckCommand(interaction);
        } else {
            logger.warn(`Comando desconocido: ${commandName}`);
        }
    } catch (error) {
        logger.error('Error manejando comando:', error);
        
        try {
            const errorMessage = '❌ Error interno del bot. Inténtalo más tarde.';
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, flags: 64 });
            }
        } catch (replyError) {
            logger.error('Error enviando respuesta de error:', replyError);
        }
    }
});

// Manejar errores
client.on('error', (error) => {
    logger.error('Error del cliente de Discord:', error);
});

client.on('warn', (warning) => {
    logger.warn(`Advertencia de Discord: ${warning}`);
});

// Conectar el bot
logger.info('Iniciando bot de Discord...');
client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        logger.info('Proceso de login iniciado');
    })
    .catch((error) => {
        logger.error('Error en el login:', error);
        process.exit(1);
    });
