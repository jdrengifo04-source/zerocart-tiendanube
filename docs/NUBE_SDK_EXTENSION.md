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
- **Formato IIFE:** El bundle resultante **debe** exportarse bajo el formato IIFE (Immediately Invoked Function Expression). Las exportaciones CommonJS o ESM no se ejecutarán debidamente al inyectarse.
- **Minificación y limpieza:** El código final debe estar minificado (`minify: true`) y comprimido en un único archivo, típicamente llamado `index.global.js`.
- **Sin Dependencias Externas (React):** La build no debe incluir dependencias de `react` o `react-dom`.

## 7. Despliegue y Aprobación (Pendiente Documentación Oficial TN)

Los pasos finales requieren asistencia del canal de Integraciones (API) de Tiendanube (`api@tiendanube.com`):
1. Instrucciones para registrar correctamente la URL pública de producción de tu `index.global.js` (ej. `https://assets.zerocart.app/checkout/index.global.js`) en la configuración del Partner Portal.
2. Identificación exacta del árbol de propiedades (ej. `state.cart.id` vs `state.order.id`) que el partner debe usar de forma canónica para identificar un Pedido Finalizado de forma inequívoca en la fase `success`.
3. Herramientas o ambientes (sandboxes de testing locales) recomendados para emular el *location:updated* del Checkout V3 sin tener que pagar pedidos reales en producción.
