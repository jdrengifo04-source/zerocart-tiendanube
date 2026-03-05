# Guía de Integración NubeSDK - Checkout V3 (Página de Gracias)

## 🚧 El Paradigma del Web Worker en Checkout V3
A diferencia del Storefront (la tienda pública) donde los scripts de partners se inyectan directamente en el DOM y pueden manipular el HTML usando `document.querySelector`, el **Checkout V3 de Tiendanube ejecuta las extensiones en un entorno aislado (Sandbox) basado en Web Workers**.

Esto significa que:
- **NO hay acceso al DOM** (`window`, `document`, HTML directo).
- **NO se puede usar CSS clásico** ni Tailwind.
- **NO se pueden usar componentes de React genéricos** que asuman que renderizarán HTML (ej. `<div>`, `<a>`, `<button>`).

## 🛠️ La Solución Oficial: NubeSDK y Componentes Declarativos
Para interactuar con el Checkout V3, Tiendanube requiere utilizar su propio SDK y sus librerías de componentes declarativos. 

Nuestra extensión es una "Micro-App" de React empaquetada en un único archivo JavaScript (`index.global.js`) que el Web Worker de Tiendanube descarga y ejecuta.

### Dependencias Clave Clave (Disponibles públicamente en NPM)
- `@tiendanube/nube-sdk-types`: Define los tipos TypeScript (estado, eventos, slots).
- `@tiendanube/nube-sdk-ui`: Motor interno del SDK.
- `@tiendanube/nube-sdk-jsx`: Los componentes que usamos para construir la UI (`<Box>`, `<Text>`, `<Link>`).

### Arquitectura de Construcción (Build)
Utilizamos `tsup` (o Vite con plugins de un solo archivo) configurado para tomar nuestro código base (`src/index.tsx`) y compilar todas sus dependencias en un formato **IIFE (Immediately Invoked Function Expression)**. 
- **Comando:** `npx tsup`
- **Output:** `dist/index.global.js` (Este es el archivo final que se sube a producción y se registra en el Portal de Partners).

## 💻 Implementación Técnica (El Código)

### 1. Escuchar el Evento Correcto
Para saber cuándo el usuario llegó a la "Página de Gracias", nos suscribimos al evento del SDK:
```typescript
nube.on("location:updated", async (eventData: any) => {
    const state = eventData?.state || (nube as any).getState?.();
    const { location, cart, store } = state;

    // Verificar que estamos en Checkout -> Éxito
    if (location?.page?.type === "checkout" && location?.page?.data?.step === "success") {
        // Ejecutar lógica de la página de gracias...
    }
});
```
*Nota importante:* El evento se llama `"location:updated"` según los tipos internos del SDK (no `"LocationChanged"`).

### 2. Renderizar UI en el Slot Permitido
El checkout expone "Slots" (espacios predefinidos) donde podemos inyectar nuestra interfaz. Utilizamos el método `nube.render()` sobre el slot `"after_main_content"`.

```typescript
nube.render("after_main_content", (
    <Box padding="20px" borderRadius="8px" background="#f0fdf4" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#bbf7d0" }}>
        <Text color="#166534" modifiers={["bold"]}>
            ¡Aquí tienes tus productos digitales!
        </Text>
    </Box>
));
```

### 3. Uso Estricto de Propiedades NubeSDK
No puedes usar HTML o props de CSS de React genéricas. Debes inspeccionar `@tiendanube/nube-sdk-jsx/dist/index.d.ts` para ver cómo el SDK espera que le pases el estilo:
- **Colores Básicos / Backgrounds**: `<Box background="#ffffff">`, `<Text color="#000000">`
- **Tipografía**: `<Text modifiers={["bold", "italic"]}>` (en vez de font-weight).
- **Dimensiones**: `<Box padding="10px" margin="5px">`
- **Bordes Especiales**: Si el componente nativo no tiene una prop como `borderCode`, el SDK permite una prop `style` parcial: `style={{ borderWidth: "1px", borderStyle: "solid" }}`.

### 4. Peticiones de Red (Fetch)
A pesar de estar aislado, **el Web Worker soporta al 100% la API nativa `fetch()` y no bloquea CORS** siempre que nuestro backend (Ej. `api.zerocart.app`) retorne las cabeceras CORS correctas (permitiendo el origen del Checkout de Tiendanube o `*`).
Cualquier llamada (por ejemplo, para obtener los enlaces de Google Drive desde nuestra Base de Datos) se hace igual que en el navegador.

## 🧹 Limpieza (Cleanup)
Es importante limpiar el slot si el usuario abandona la página de éxito o si el evento `location:updated` vuelve a dispararse en otra sección:
```typescript
nube.clearSlot("after_main_content");
```
