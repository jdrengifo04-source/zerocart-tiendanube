# Guía de Despliegue - Zerocart en EasyPanel

Este documento detalla la configuración específica necesaria para que Zerocart funcione en un entorno de Hostinger VPS con EasyPanel.

## Configuración de Docker
El proyecto utiliza un `Dockerfile` multi-stage:
1. **Frontend Builder**: Compila la aplicación React.
2. **Final Stage**: 
   - Copia el build del frontend al backend.
   - Compila TypeScript a JavaScript.
   - Ejecuta `npx prisma generate`.
   - El comando de inicio es `npx prisma migrate deploy && npm start`.

## Reglas de Oro para Producción

### 1. Prisma Versioning
Estamos utilizando **Prisma v6.x**. 
> [!WARNING]
> No actualizar a v7 sin implementar `prisma.config.ts`, ya que la versión 7 elimina el soporte para `url` directo en `schema.prisma`.

### 2. Express 5 & Routing
Estamos usando **Express 5**. 
> [!IMPORTANT]
> Las rutas catch-all para Single Page Applications (SPA) no deben usar el asterisco simple `*`. Se recomienda el uso de un middleware `app.use((req, res) => { ... })` para manejar el fallback al `index.html` de manera segura.

### 3. Variables de Entorno en EasyPanel
Para que la base de datos se conecte correctamente:
- `DATABASE_URL`: Debe apuntar al nombre de servicio del contenedor de la base de datos dentro de la red de EasyPanel (ej: `zerocart_zerocart-db:5432`).
- No usar comillas en los valores de las variables en la interfaz de EasyPanel.
- Asegurarse de activar "Create .env file" en la pestaña Enviroment.

### 4. Accesibilidad (Binding)
El servidor DEBE escuchar en `0.0.0.0` para ser accesible fuera del contenedor:
```typescript
app.listen(PORT, '0.0.0.0', ...)
```

## Solución de Problemas (Troubleshooting)
- **Error 502 / Service Not Reachable**: Verificar que el puerto en la pestaña "Domains" de EasyPanel coincida con el `PORT` configurado (actualmente `3001`).
- **Prisma Error P1012**: Verificar que el esquema no tenga propiedades de `url` no soportadas por la versión instalada.
- **PathError en Express**: Revisar la sintaxis de las rutas en `src/index.ts`.
