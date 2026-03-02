# Integración con Tiendanube - Zerocart

Este documento explica cómo Zerocart interactúa con Tiendanube y cómo se gestiona la identidad de las tiendas.

## Modelo de Aplicación
Zerocart es una aplicación de tipo **"App Externa"** con capacidades de inyección de scripts.

### Identificación del Usuario (Login)
Actualmente, el flujo de autenticación funciona mediante OAuth 2.0:

1. **Instalación**: El usuario instala la App desde la Tienda de Aplicaciones de Tiendanube.
2. **Redirección**: Tiendanube redirige al usuario a nuestra URL de Redirect con un parámetro `code`.
3. **Token**: El backend intercambia ese `code` por un `access_token` permanente.
4. **Persistencia**: Este token debe guardarse asociado al `store_id` en nuestra base de datos para futuras peticiones.

> [!NOTE]
> En la fase actual de desarrollo, estamos utilizando credenciales fijas (`TEST_STORE_ID`) en el archivo `.env`. El siguiente paso evolutivo es implementar la tabla `Store` para permitir que múltiples usuarios usen la App de forma independiente.

## Puntos de Integración

### 1. Inyección de JavaScript
Utilizamos el endpoint de `scripts` para inyectar `buy-now.js`.
- **Ubicación**: Se carga en todas las páginas de la tienda (`where: 'store'`).
- **Evento**: `onload`.

### 2. Webhooks
Estamos suscritos al evento `order/paid`.
- **Endpoint**: `/api/webhooks/order-paid`.
- **Seguridad**: Se debe implementar verificación de firma (HMAC) para asegurar que la petición viene realmente de Tiendanube.

### 3. API de Productos
Se utiliza para listar los productos del catálogo del cliente y permitirle asignarles archivos digitales.
- **Endpoint**: `GET /v1/{store_id}/products`.
