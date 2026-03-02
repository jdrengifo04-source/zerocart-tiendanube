# --- Etapa 1: Build del Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Etapa 2: Preparación del Backend ---
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copiar el código del backend
COPY backend/ ./backend/
# Copiar el build del frontend a la carpeta de archivos estáticos del backend
COPY --from=frontend-builder /app/frontend/dist ./backend/client-dist

# Variables de entorno por defecto
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

WORKDIR /app/backend
# Generar el cliente de Prisma
RUN npx prisma generate
# Compilar el backend de TS a JS
RUN npm run build

# Comando para arrancar: 
# 1. Empuja las migraciones de la base de datos
# 2. Arranca el servidor usando Node (más rápido y estable que ts-node)
CMD npx prisma migrate deploy && npm start
