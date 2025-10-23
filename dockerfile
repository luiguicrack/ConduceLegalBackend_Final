FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el código
COPY . .

# Crear directorio para migraciones
RUN mkdir -p scripts/migrations

# Hacer ejecutables los scripts
RUN chmod +x scripts/wait-for-db.sh

EXPOSE 3000

# Usar tu migración existente y luego iniciar el servidor
CMD ["sh", "-c", "scripts/wait-for-db.sh db && node config/migrateDB.js && npm start"]