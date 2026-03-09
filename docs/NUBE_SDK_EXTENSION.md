# Documentación de la Extensión NubeSDK (Página de Gracias)

Este documento detalla la arquitectura, restricciones y soluciones implementadas para la integración de ZeroCart dentro del Checkout V3 de Tiendanube (NubeSDK).

## 1. El Entorno de Ejecución: Web Workers Aislados
A diferencia de los scripts de tienda, **las extensiones de Checkout V3 se ejecutan en un Web Worker aislado.**

### Implicaciones Críticas:
- **NO HAY ACCESO AL DOM:** `window`, `document`, y `localStorage` **no existen**. Cualquier intento de acceder a ellos lanzará un error (`ReferenceError`).
- **Módulos ESM:** El script debe ser un módulo ES que exporte una función inicializadora: `export function App(nube) { ... }`.
- **Renderizado Declarativo:** La interfaz no se manipula directamente. Se envían objetos JSON a `nube.render()` y el SDK se encarga de actualizarlos de forma segura en el DOM real.

## 2. Esquema JSON de Componentes
Tiendanube espera objetos JSON estrictos, no componentes de React ni JSX compilado de forma tradicional.

**Reglas del Esquema:**
1. **Atributo `type`**: Define el componente en minúsculas (ej. `"box"`, `"txt"`, `"link"`, `"alert"`).
2. **Propiedades Planas**: Atributos como `padding`, `background`, y `align` van en la raíz del objeto, no anidados.
3. **Anidamiento con `children`**: El contenido y elementos hijos se pasan en un arreglo `children`.

### Ejemplo Práctico:
```javascript
nube.render("after_main_content", [
    {
        type: "box",
        padding: "16px",
        background: "surfaceSuccess",
        children: [
            { type: "txt", modifiers: ["bold"], children: "¡Listo para descargar!" },
            { type: "link", href: "https://...", children: "Descargar ahora" }
        ]
    }
]);
```

## 3. Identificador Canónico (Order ID)
En el paso `success` del checkout, la referencia oficial para asociar compras es **`state.cart.id`**. Este ID es el que el backend debe usar para buscar productos digitales, ya que coincide con el `cart_id` enviado en los webhooks de orden creada.

## 4. Estrategia Anti-Parpadeo (V32 Final Fix)
Tiendanube puede re-renderizar la página de éxito múltiples veces. Sin control, esto causa bucles infinitos de parpadeo.

**Solución Implementada**:
Usamos un "lock" basado en el ID del pedido y una bandera de carga.
```javascript
let lastRenderedOrderId = null;
let isFetching = false;

const renderThankYou = async (state) => {
    const orderId = state.order?.id || state.cart?.id;
    
    // 🛡️ Lock: Evitar re-renderizado si es el mismo pedido
    if (lastRenderedOrderId === orderId || isFetching) return;

    isFetching = true;
    // Petición al backend...
    nube.render("after_header", [ ... componentes ... ]);
    
    lastRenderedOrderId = orderId;
    isFetching = false;
};
```

## 5. Compilación y Despliegue
- **Herramienta**: `tsup` para generar un bundle ESM único.
- **Portal de Partners**: Es **OBLIGATORIO** marcar la opción **"Usa NubeSDK"** al registrar la URL del script.
- **Cache**: Siempre usa una nueva versión en el nombre del archivo (ej. `index.v30.js`) al subir cambios, para evitar que el CDN de Tiendanube sirva código antiguo.

## 6. Integración de Descargas (Fase 10)
La extensión recupera los enlaces en tiempo real desde:
`GET https://zerocart.jrengifo.com/api/order/details?cart_id={cart_id}&store_id={store_id}`
