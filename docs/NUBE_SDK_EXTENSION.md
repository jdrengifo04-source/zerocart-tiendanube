# Documentación de la Extensión NubeSDK para Checkout V3

Este documento detalla la arquitectura, las restricciones técnicas y el flujo de trabajo para la extensión de Checkout V3 de Tiendanube (ZeroCart) utilizando el paquete `@tiendanube/nube-sdk-ui` / `@tiendanube/nube-sdk-jsx` dentro del entorno de Web Workers.

## 1. El Paradigma del Web Worker

El Checkout V3 de Tiendanube introduce un cambio de paradigma crucial: **las extensiones de terceros no se ejecutan en el DOM principal (browser nativo), sino de forma aislada dentro de un Web Worker (Sandbox).**

Esto tiene implicaciones directas y estrictas en cómo se deben desarrollar las aplicaciones.

### Restricciones Críticas:
1. **NO HAY ACCESO AL DOM:** No puedes usar `document`, `window`, o funciones como `getElementById`, `querySelector`, etc.
2. **FRAMEWORKS PROHIBIDOS:** El uso de frameworks como **React, Vue, Angular, Svelte, etc., está estrictamente prohibido**. La extensión *no es una aplicación React*, aunque utilice sintaxis JSX (a través del compilador del SDK).
3. **NO HAY HOOKS NI ESTADO COMPLEJO LOCAL:** No se pueden utilizar hooks como `useState`, `useEffect`, etc. Todo re-renderizado de la interfaz debe ser manejado reactivamente llamando a la función `nube.render()` en respuesta a eventos del SDK o promesas resueltas.

## 2. Arquitectura de UI Declarativa (Design Tokens)

Dado que no hay DOM y no hay React, Tiendanube provee sus propios componentes de UI nativos a través de `@tiendanube/nube-sdk-jsx`. Estos componentes son abstracciones que el Web Worker serializa y envía al DOM real para ser renderizados de forma segura.

### Reglas para la Creación de Interfaz:
1. **Importación:** Todos los componentes nativos (como `<Box>`, `<Text>`, `<Link>`) DEBEN ser importados de `@tiendanube/nube-sdk-jsx` (o `@tiendanube/nube-sdk-ui`).
2. **Propiedad de Estilo (Prohibido):** Los componentes nativos del SDK **no soportan el atributo `style` nativo ni aceptan CSS arbitrario** o códigos hexadecimales de colores directamente.
3. **Uso de Design Tokens:** Todo el estilo debe aplicarse utilizando las propiedades o "Design Tokens" permitidos por los tipos del SDK. Por ejemplo:
   - *Incorrecto:* `<Box style={{ padding: '20px', backgroundColor: '#f0f9ff' }}>`
   - *Correcto:* `<Box padding="16px" backgroundColor="surfaceSecondary">`
4. **Listas y Keys:** Al generar listas dinámicas de componentes usando `map()` (como recorrer un array de productos), el elemento raíz en cada iteración DEBE ser un componente oficial del SDK (ej. `<Box>`), y la propiedad `key={id}` sigue siendo obligatoria para que el SDK procese correctamente las mutaciones de la lista.

## 3. Navegación Externa (`<Link>`)

Existe una diferenciación clave entre la navegación interna (SPA) y la navegación externa.

- **Navegación Interna (SPA):** Métodos como `browser.navigate` desde el SDK o `history.pushState` no pueden usarse para redirigir fuera del dominio de la tienda por restricciones de seguridad (Security Sandbox).
- **Navegación Externa:** El componente declarativo `<Link>` oficial del SDK **sí admite URLs absolutas externas**. Es seguro y recomendado utilizar `<Link href="https://ejemplo.com/recurso.pdf" target="_blank">` para abrir recursos en pestañas nuevas.

## 4. Obtención de Datos y Red (CORS)

A pesar de las restricciones del Sandbox del DOM, **el entorno del Web Worker del Checkout sí permite el uso pleno de la API nativa `fetch` para peticiones de red**.

Puedes hacer peticiones POST/GET a tu backend externo (ej. `api.zerocart.app`) siempre y cuando tu backend esté configurado para soportar los headers de **CORS** requeridos (aceptar peticiones desde el dominio de Tiendanube y sus subdominios de checkout).

## 5. El Emisor de Eventos y el Ciclo de Vida del Checkout

La lógica de tu extensión se suscribe al ciclo de vida del checkout utilizando el bus de eventos del SDK: `nube.on(...)`.

### Detectar la Página de Gracias
Para identificar cuándo el usuario ha finalizado la compra de manera exitosa y capturar los datos necesarios:

```typescript
nube.on("location:updated", async (eventData: any) => {
    // 1. Obtener el estado primario del evento O del SDK como fallback
    const state = eventData?.state || (nube as any).getState?.();
    if (!state) return;

    // 2. Validar que la posición actual en el flujo es el "success" del checkout
    if (state.location?.page?.type === "checkout" && state.location?.page?.data?.step === "success") {
        
        // 3. Renderizar vista de carga en el slot deseado a través de una UI Declarativa
        nube.render("after_main_content", (
             <Box padding="16px">
                 <Text>Cargando información...</Text>
             </Box>
        ));

        // 4. Lógica asíncrona de obtención de datos
        // ... (Tu llamada fetch) ...
        
        // 5. Re-renderizado de resultados
        nube.render("after_main_content", ( ...resultados... ));
    } else {
        // Obligatorio: Limpiar de forma declarativa el slot de UI si el usuario sale de esta fase.
        nube.render("after_main_content", []); 
        // Alternativamente, si el método existe según tipos de Tiendanube, puedes usar nube.clearSlot('after_main_content');
    }
});
```

## 6. Proceso de Compilation / Build

Dado que la extensión debe ser asimilada por Tiendanube como un script embebido de forma pura en un worker, el proceso de compilación es muy distinto al de una app SPA tradicional producida por `Vite` o `Create React App`.

### Herramienta: `tsup`
Utilizamos `tsup` (esbuild) en lugar de Vite para generar un único archivo JavaScript extremadamente ligero y estandarizado.

**Configuración requerida (`tsup.config.ts` o equivalente):**
- **Formato ESM:** El bundle resultante **debe** exportarse bajo el formato de módulo de ES (`esm`). A diferencia de las extensiones tradicionales en el DOM que usan IIFE, el sandbox de Tiendanube inyecta el script dinámicamente (`import(...)`) y espera encontrar una exportación nombrada `App` (`export function App(nube: NubeSDK) { ... }`).
- **Minificación y limpieza:** El código final debe estar minificado (`minify: true`) y comprimido en un único archivo, típicamente llamado `index.global.js` o `main.js`.
- **Sin Dependencias Externas (React):** La build no debe incluir dependencias de `react` o `react-dom`.

## 7. Despliegue, Testeo y Consideraciones Finales

### 7.1. Registro de la Extensión (Partner Portal)
Para que Tiendanube reconozca y ejecute el script dentro del entorno seguro de Web Workers, **no se usa la API de inyección tradicional**, sino la interfaz gráfica del **Partner Portal**:

1. Ingresa a la Configuración de tu App en el Partner Portal.
2. Ve a la sección de **Scripts**.
3. Ingresa la URL (ya sea de desarrollo local o producción en tu backend).
4. **CRÍTICO:** Debes marcar expresamente la opción **"Usa NubeSDK"**. Sin esta opción (flag), el script fallará porque será inyectado de la forma antigua (en el DOM) en lugar del sandbox del Web Worker.
5. El servidor que aloje el archivo (tu backend) debe tener `HTTPS` y sus cabeceras **CORS** correctamente configuradas.

### 7.2. Herramientas de Testeo Local / Sandbox
Para desarrollar iterativamente sin necesidad de publicar a la URL real ni hacer compras reales, el flujo de desarrollo oficial de Tiendanube recomienda:

1. **URL Local:** En el Partner Portal, puedes registrar una URL local (ej: `http://localhost:8080/index.global.js`).
2. **Nube DevTools:** Se debe instalar la extensión de Chrome **Nube DevTools**. Esta extensión es mandatoria ya que permite visualizar todos los eventos (como `cart:update`, `location:updated`) y el `NubeSDKState` en tiempo real.
3. Permite hacer pruebas de flujo (Checkout de Prueba o pago manual "A convenir") en la Tienda de Prueba del Partner sin tarjetas de crédito.

### 7.3. Identificador Canónico (Order ID)
En el ecosistema de Tiendanube SDK, el estado (`NubeSDKState`) **no cuenta con un objeto `state.order.id` en el paso 'success'**. 

La referencia **canónica, oficial y correcta** para asociar una compra generada desde el frontend es siempre **`state.cart.id`**. Este ID de carrito es el que luego figurará en los webhooks de "Orden Creada" que recibirá nuestro backend. No debe ser tratado como un "fallback", sino como el Primary Key válido y definitivo desde la perspectiva del cliente que navega el checkout.

## 8. Integración Dinámica de Descargas (v26.1)

A partir de la versión 26.1, la extensión no muestra enlaces estáticos, sino que los recupera en tiempo real.

### 8.1. El Endpoint de Detalle de Orden
`GET https://zerocart.jrengifo.com/api/order/details?cart_id={cart_id}&store_id={store_id}`

**Parámetros requeridos:**
- `cart_id`: Obtenido de `nube.getState().cart.id`.
- `store_id`: Obtenido de `nube.getState().store.id`. Es vital pasar ambos para asegurar multi-tenancy.

### 8.2. Flujo de Renderizado Reactivo
Dada la naturaleza del Web Worker, el flujo implementado es:
1. **Initial Render**: Se llama a `nube.render` con datos genéricos ("Tu Producto Digital") para no dejar la pantalla vacía.
2. **Async Fetch**: Se dispara la petición al backend.
3. **Success Update**: Si el backend responde con un `googleDriveLink`, se llama de nuevo a `nube.render` con el enlace real.
4. **Shadowing Prevention**: Importante usar variables locales (ej. `currentProductName`) para evitar conflictos con las variables extraídas del estado inicial del carrito.

## 9. Estrategia de Versionado y Cache

El CDN de Tiendanube y los navegadores modernos cachean agresivamente los scripts de extensión. 

**Regla de Oro:** Si realizas cambios en el diseño o la lógica (especialmente en `index.tsx`), **NUNCA** sobrescribas el mismo archivo `index.v26.js`. 
- Crea una nueva versión: `index.v26.1.js`, `index.v27.js`.
- Actualiza la URL en el Portal de Partners.
- Esto garantiza que el cambio sea instantáneo para todos los usuarios.
