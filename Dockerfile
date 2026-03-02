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
# Copiar el build del frontend a una carpeta específica en el backend
COPY --from=frontend-builder /app/frontend/dist ./backend/client-dist

# Variables de entorno por defecto
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

WORKDIR /app/backend
# Generar el cliente de Prisma para el entorno de producción (Linux)
RUN npx prisma generate

# Comando para arrancar (usamos ts-node-esm para no complicar el build de TS por ahora)
CMD ["npx", "ts-node", "--esm", "src/index.ts"]
