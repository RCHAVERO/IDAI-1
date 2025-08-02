const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    getTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').substr(0, 19);
    }

    getDateString() {
        const now = new Date();
        return now.toISOString().substr(0, 10);
    }

    writeToFile(level, message, error = null) {
        const timestamp = this.getTimestamp();
        const dateString = this.getDateString();
        const logFile = path.join(this.logDir, `${dateString}.log`);
        
        let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (error) {
            logEntry += `\nError: ${error.message}`;
            if (error.stack) {
                logEntry += `\nStack: ${error.stack}`;
            }
        }
        
        logEntry += '\n';

        try {
            fs.appendFileSync(logFile, logEntry);
        } catch (err) {
            console.error('Error escribiendo al archivo de log:', err);
        }
    }

    info(message) {
        console.log(`ℹ️  ${message}`);
        this.writeToFile('INFO', message);
    }

    success(message) {
        console.log(`✅ ${message}`);
        this.writeToFile('SUCCESS', message);
    }

    warn(message) {
        console.warn(`⚠️  ${message}`);
        this.writeToFile('WARN', message);
    }

    error(message, error = null) {
        console.error(`❌ ${message}`);
        if (error) {
            console.error(error);
        }
        this.writeToFile('ERROR', message, error);
    }

    debug(message) {
        // Siempre mostrar debug en esta versión para diagnosticar
        console.log(`🐛 ${message}`);
        this.writeToFile('DEBUG', message);
    }

    command(user, command, steamId = null) {
        const message = `Usuario ${user} ejecutó comando ${command}${steamId ? ` con Steam ID: ${steamId}` : ''}`;
        this.info(message);
    }

    apiCall(endpoint, steamId, success = true) {
        const status = success ? 'SUCCESS' : 'FAILED';
        const message = `API Call to ${endpoint} for Steam ID ${steamId} - ${status}`;
        this.debug(message);
    }
}

module.exports = new Logger();
