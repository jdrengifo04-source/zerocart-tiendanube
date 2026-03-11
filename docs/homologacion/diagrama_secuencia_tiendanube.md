# Diagramas de Secuencia y Alcances (Scopes) - ZeroCart

Para cumplir con los requisitos de publicación de Tiendanube, a continuación se detallan los flujos técnicos principales de la aplicación ZeroCart. Estos diagramas justifican el uso de los alcances (*scopes*) obligatorios solicitados: `write_products`, `write_scripts`, `read_orders`, y `read_customers`.

---

## 1. Flujo de Instalación de la Aplicación (Autenticación OAuth)

Este flujo justifica la necesidad de acceso a los datos del comerciante y la capacidad de interactuar con la API en su nombre.

```mermaid
sequenceDiagram
    participant Merchant as Comerciante
    participant TN as Tiendanube (OAuth)
    participant Backend as ZeroCart API
    participant DB as ZeroCart DB (PostgreSQL)

    Merchant->>TN: Clic en "Instalar Aplicación"
    TN->>Merchant: Pantalla de Aceptación de Permisos (Scopes)
    Merchant->>TN: Acepta permisos
    TN->>Backend: Redirección con código temporal (?code=...)
    Backend->>TN: Intercambia código por Access Token (POST /oauth/access_token)
    TN-->>Backend: Retorna Access Token + ID de Tienda
    Backend->>TN: Obtiene datos del perfil y email (GET /store)
    TN-->>Backend: Retorna información básica
    Backend->>DB: Guarda Credentials (Token, StoreID, Email)
    Backend-->>Merchant: Redirige al Dashboard de ZeroCart (Login mágico)
```

**Alcances Justificados aquí:**
- El acceso básico base de OAuth permite leer el perfil para crear la cuenta del usuario en nuestra base de datos sincronizada.

---

## 2. Flujo de Inyección de Script e Interacción del Botón (1-Click)

Este es el proceso *core* de la aplicación en el Frontend de la tienda. Justifica la necesidad de poder inyectar scripts y leer el catálogo de productos.

```mermaid
sequenceDiagram
    participant Cliente as Comprador Final
    participant Storefront as Tienda (Navegador)
    participant TN_API as API Tiendanube
    participant Backend as ZeroCart API

    Note over Backend, TN_API: En el dashboard, al activar ZeroCart:
    Backend->>TN_API: POST /scripts/ (Inyecta buy-now.js)
    
    Note over Cliente, Storefront: El comprador visita un producto
    Cliente->>Storefront: Visualiza ficha de producto digital
    Storefront->>Storefront: buy-now.js oculta botón "Agregar al carrito" y muestra "Comprar Ahora"
    
    Cliente->>Storefront: Clic en "Comprar Ahora" (1-Click $)
    Storefront->>Backend: POST /comprar/ (Envía Producto ID y Variante)
    Backend->>TN_API: GET /products/{id}/variants/{id}
    TN_API-->>Backend: Retorna precio, imagen y disponibilidad
    Backend->>Backend: Valida si es producto digital vinculado en DB
    Backend-->>Storefront: Retorna Tokens de Sesión para Checkout
    Storefront->>Cliente: Redirección directa a /checkout/v3/start/ (Sin pasar por el carrito)
```

**Alcances Justificados aquí:**
- `write_scripts` / `read_scripts`: Obligatorio para poder inyectar `buy-now.js` asíncronamente en el portal del cliente sin requerir modificaciones manuales en su tema (theme).
- `read_products`: Necesario para que nuestro endpoint `/comprar/` pueda re-validar dinámicamente el precio real y las variantes del ítem digital antes de redirigirlo directamente al módulo de pago, evitando errores de carritos vacíos (Error 404).

---

## 3. Flujo de Página de Gracias (NubeSDK) y Entrega de Archivos

Este flujo explica cómo ZeroCart completa su promesa de valor entregando el producto una vez que el pago se efectúa.

```mermaid
sequenceDiagram
    participant TN_Checkout as Checkout V3 (Tiendanube)
    participant Backend as ZeroCart API
    participant Drive as Google Drive / AWS
    participant Email as Casilla Correo (Cliente)

    Note over TN_Checkout: Cliente finaliza el pago exitosamente
    TN_Checkout->>TN_Checkout: Carga la página de gracias
    TN_Checkout->>Backend: Extensión NubeSDK hace fetch de confirmación (OrderId)
    
    Backend->>TN_Checkout: API Tiendanube (Validar estado de la orden GET /orders/{id})
    TN_Checkout-->>Backend: Orden Aprobada (Pago confirmado)
    
    Backend->>DB: Busca los enlaces directos (Drive) vinculados al Producto
    Backend-->>TN_Checkout: Retorna UI con botón "Descargar Ahora" (NubeSDK UI)
    
    TN_Checkout->>TN_Checkout: El cliente descarga el archivo en pantalla
    
    Note over Backend, Email: Fallback de seguridad asíncrono
    TN_Checkout-->>Backend: Webhook asíncrono (order/paid)
    Backend->>Email: Envío de email con copia de los enlaces de acceso
```

**Alcances Justificados aquí:**
- `read_orders`: Fundamental para leer el estado del pago directamente en la Página de Gracias (Checkout V3 en Web Worker) y permitir/denegar el acceso al archivo en pantalla. También es requerido por nuestro sistema de Webhooks para activar el correo de respaldo (fallback).
- `read_customers`: Requerido extraer el correo del comprador final desde la Orden recién pagada para enviarle la copia de respaldo de sus enlaces de descarga, tal como se comprometió la aplicación.
