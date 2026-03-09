# Arquitectura Técnica - Zerocart

## Flujo de Datos Principal

### 1. Permisos de Tiendanube (Scopes)
Para operar correctamente, Zerocart requiere de la autorización del comercio para los siguientes permisos vía OAuth:
- **Products (read/write)**: Extraer precios reales y mostrar lista de productos.
- **Scripts (read/write)**: Inyectar automáticamente botones dinámicos ("Comprar Ahora") y redirecciones al finalizar la compra.
- **Orders (read)**: Leer webhooks de `order-paid` para liberar PDFs.
- **Customers (read)**: Respaldo para enviar emails o SMS al cliente si falla la redirección luego del pago.

### 2. Inyección de Script (`buy-now.js`)
La aplicación inyecta scripts dinámicos en la tienda del cliente usando la API de `/scripts` de Tiendanube. La URL del script se conecta a un endpoint dinámico (`/api/scripts/buy-now.js?store_id=...`) que genera el código en base a las preferencias de la tienda en DB.
- **Función**: Intercepta el clic en el botón de compra ("Comprar ahora").
- **Comportamiento**: Redirige al usuario a un checkout personalizado o modifica el comportamiento estándar.

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
El modelo de datos se divide en:

### Modelo `Store`
- `id`: Store ID de Tiendanube (Primary Key).
- `accessToken`: Token OAuth de la tienda específica.
- `oneClickEnabled`: Booleano para activar/desactivar el botón.
- `oneClickText`, `oneClickBgColor`, `oneClickTextColor`, `oneClickSize`: Cadenas de texto que guardan la personalización de diseño.

### Modelo `Product`
- `id`: ID único del producto en Tiendanube.
- `storeId`: Referencia a su tienda dueña (Relación).
- `googleDriveLink`: El recurso digital (PDF, link) a entregar automáticamente.
- `name`: Nombre descriptivo (cacheado).

### 4. Flujo de Entrega Dinámica (v26.1)
1. **Detección**: La extensión NubeSDK detecta que el usuario está en el paso `success` del checkout.
2. **Petición**: Realiza un `fetch` a `GET /api/order/details?cart_id={cartId}&store_id={storeId}`.
3. **Validación**: El backend busca el carrito, identifica los productos, y para cada uno busca el `googleDriveLink` en la tabla `Product`.
4. **Visualización**: La extensión inyecta el diseño premium (v26.1) con el enlace recuperado.

## Manejo de Archivos Estáticos
En producción, el backend sirve los archivos compilados del frontend (`client-dist`) y los scripts públicos (`public/scripts`). Esto permite que todo el sistema corra en un solo contenedor Docker.

## 5. Sistema de Versionado (Estratégico)
Se ha identificado una discrepancia entre las versiones locales y las de producción en Tiendanube que puede causar confusión.

- **Versión de Tiendanube (File ID)**: Tiendanube incrementa un contador interno de versión cada vez que se sube/actualiza un archivo en el portal de partners (ej. v13, v25). **No** tenemos control sobre este número.
- **Versión Interna de Zerocart**: Marcamos nuestro código con etiquetas de versión claras (ej. `V32-FinalFix`) que se imprimen en la consola del navegador: `[ZeroCart] 🛡️ Checkout Extension V32...`.

**Recomendación**: Siempre verificar la versión en los logs de la consola antes de diagnosticar, ignorando el número que muestre la interfaz de Tiendanube.
