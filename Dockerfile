# Dockerfile para el bot de Discord
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Exponer el puerto (opcional, para healthcheck)
EXPOSE 3000

# Comando para iniciar el bot
CMD ["node", "index.js"]
