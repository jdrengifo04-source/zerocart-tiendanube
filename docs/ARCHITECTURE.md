# Arquitectura Técnica - Zerocart

## Flujo de Datos Principal

### 1. Inyección de Script (`buy-now.js`)
La aplicación inyecta un script en la tienda del cliente mediante la API de `/scripts` de Tiendanube.
- **Función**: Intercepta el clic en el botón de compra ("Comprar ahora").
- **Comportamiento**: Redirige al usuario a un checkout personalizado o modifica el comportamiento estándar para asegurar que el proceso pase por Zerocart para el cobro de comisiones.

### 2. Panel de Administración (Frontend)
El dueño de la tienda accede a `zerocart.jrengifo.com` para configurar su experiencia y sus productos. La arquitectura Frontend está modularizada en:
- **Vista de Productos**: Permite visualizar sus productos de Tiendanube (con precios reales extraídos de la API) y asignar un enlace de Google Drive a cada uno.
- **Configuración "1 Click $"**: Interfaz donde el usuario puede personalizar colores, texto y tamaño del botón de compra directa que se inyectará en su tienda. Incluye una previsualización dinámica.
- **Dashboard/Tutoriales**: Área de onboarding y guía de uso.

Estas configuraciones se guardan en la base de datos de Zerocart a través del backend.

### 3. Procesamiento de Pagos (Webhooks)
Cuando se realiza un pago en la tienda:
1. Tiendanube envía un Webhook `order-paid` al backend de Zerocart.
2. El backend verifica si la orden contiene productos digitales configurados.
3. El backend utiliza la API de Tiendanube para crear un "Charge" (cobro) de comisión al dueño de la tienda.
4. Se envía automáticamente el enlace del producto digital al comprador.

## Base de Datos (Prisma)
El modelo principal actual es `Product`:
- `id`: ID único de Tiendanube.
- `storeId`: Identificador de la tienda (para soporte multi-tienda).
- `googleDriveLink`: El recurso digital a entregar.

## Manejo de Archivos Estáticos
En producción, el backend sirve los archivos compilados del frontend (`client-dist`) y los scripts públicos (`public/scripts`). Esto permite que todo el sistema corra en un solo contenedor Docker.
