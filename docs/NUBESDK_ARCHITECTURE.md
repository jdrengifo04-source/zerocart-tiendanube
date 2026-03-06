# Arquitectura y Diseño de la Extensión NubeSDK para Checkout (ZeroCart)

Este documento detalla la arquitectura, restricciones y soluciones implementadas para la integración de la entrega de productos digitales de ZeroCart dentro del Checkout V3 de Tiendanube (NubeSDK).

## 1. El Entorno de Ejecución: Web Workers Aislados

A diferencia de los scripts tradicionales de frontend que se inyectan en el DOM (`window`, `document`), **las extensiones de Checkout V3 de Tiendanube se ejecutan dentro de un Web Worker aislado.**

### Implicaciones Críticas:
- **No hay acceso al DOM o a la ventana (Window):** Variables globales como `window`, `document`, o `localStorage` **no existen**. Cualquier intento de acceder a ellas lanzará un error y detendrá la ejecución del Worker.
- **Llamadas de red seguras:** El Worker intercepta las solicitudes de red. Todas las llamadas a APIs externas (como el backend de ZeroCart) se analizan bajo estrictas políticas de CSP (Content Security Policy).
- **Inyección mediante Función Exportada:** El script de la extensión no puede ser simplemente evaluado (IIFE puro). El Worker de Tiendanube espera importar un módulo ES (ESM) que exporte una función inicializadora, típicamente llamada `App`.

```javascript
// ✅ Estructura base requerida
export function App(nube) {
    // La instancia 'nube' es inyectada por el host
}
```

## 2. El Error "Component undefined" y la Solución Estructural

Durante el desarrollo (hasta la v20), nos encontramos con el persistente error `Component "undefined" is not supported`.

### El Origen del Problema
Inicialmente, intentamos usar JSX y el paquete `@tiendanube/nube-sdk-jsx` para compilar componentes. Sin embargo, el compilador transformaba elementos como `<Box>` en llamadas `React.createElement` o en estructuras que el motor interno de Tiendanube no reconocía en el contexto de `nube.render()`. 

Posteriormente, intentamos adivinar la estructura construyendo objetos como `{ component: "Box", props: {} }`. Esta estructura también era rechazada, ya que no representa la taxonomía interna de Tiendanube.

### La Solución Definitiva (v21 en adelante)
Al analizar la librería de tipos `@tiendanube/nube-sdk-types`, descubrimos que el motor de renderizado de Tiendanube espera **nodos JSON estrictos**, no componentes de React ni representaciones intermedias.

**Reglas del Esquema JSON de Componentes NubeSDK:**
1. **La clave es `type`:** El tipo de componente se define con la propiedad `type` en **minúsculas** (jamás `component` ni PascalCase). Ejemplos: `"box"`, `"txt"`, `"link"`, `"alert"`.
2. **Propiedades aplanadas:** Modificadores y atributos como `padding`, `background`, o `variant` van en la raíz del objeto, no anidados dentro de un objeto `props`.
3. **Anidamiento con `children`:** Los elementos hijos se pasan a través de un arreglo en la propiedad `children`. Incluso el texto plano debe pasarse así (idealmente envuelto en un tipo `"txt"`), aunque a veces el texto directo en `children` es tolerado.

### Ejemplo Práctico de Renderizado Correcto

```javascript
nube.render("after_main_content", [
    {
        type: "box",
        padding: "16px",
        background: "surfaceSuccess", // Colores de la paleta NubeSDK
        children: [
            {
                type: "txt",
                modifiers: ["bold"], 
                children: "¡Compra exitosa! Descarga aquí:"
            },
            {
                type: "box",
                margin: "8px",
                children: [
                    {
                        type: "link",
                        href: "https://drive.google.com/...",
                        variant: "primary",
                        target: "_blank",
                        children: "Descargar PDF"
                    }
                ]
            }
        ]
    }
]);
```

## 3. Flujo de Trabajo y Sistema de Eventos

La extensión escucha primariamente actualizaciones de estado para determinar cuándo está en la página correcta para actuar.

1. **Agregador de Eventos:** Nos suscribimos a múltiples canales para reaccionar ante cambios de vista: `"location:updated"`, `"cart:updated"`, `"order:updated"`.
2. **Detección de la Página de Gracias (Success):** Procesamos el estado recibido (`nube.getState()`) para extraer:
   - `location.page.type === "checkout"`
   - `location.page.data.step === "success"`
3. **Extracción del ID:** El dato más valioso es el `cartId` (o `order.id`), el cual Tiendanube garantiza que está en `state.cart.id` (o variantes según el momento exacto del webhook).
4. **Llamada Segura al Backend:** Ejecutamos un `fetch` a `zerocart.jrengifo.com/api/order/details?cart_id=XYZ`.
5. **Render Inyectado:** Si encontramos productos digitales asociados a esa orden, usamos `nube.render` en el slot reservado `"after_main_content"`.

## 4. Configuración de Compilación (Build) para el Web Worker

Dado que estamos en un Web Worker, no podemos depender de librerías enormes que causen problemas o que busquen variables de entorno (browser/node).

- **Herramienta:** `tsup`.
- **Formato:** `esm` (ES Module). Esto es innegociable, ya que Tiendanube usa `import()` remoto dinámico.
- **Dependencies:** **No debe haber dependencias pesadas**. Nada de `react` o `react-dom` en el bundle de salida. Todo el código de React pre-compilado fue removido a favor de crear los objetos de configuración puros (`type: "box"`).
- **Archivo de Salida:** `index.global.js`. Este único archivo contenido alberga toda la lógica necesaria.

## 5. Aprendizajes del Diseño Premium (v26.1)

El desarrollo del diseño premium basado en tarjetas reveló comportamientos no documentados del motor de renderizado:

1.  **Vertical Stacking (El gran "Gotcha"):** Por defecto, la raíz de `nube.render` o ciertos bloques `box` pueden intentar apilar elementos horizontalmente (estilo `row`). 
    - **Solución:** Siempre especifica `direction: "col"` en los componentes contenedores.
    - **Refuerzo:** Debido a variaciones entre el entorno de prueba y el checkout real, es recomendable inyectar estilos de flexbox directamente en la propiedad `style`:
      ```javascript
      style: { display: "flex", flexDirection: "column" }
      ```
2.  **Migración de Spacing:** Las propiedades aplanadas como `padding: "16px"` a veces son ignoradas si el componente es complejo. La forma más segura de garantizar el diseño es mover los márgenes y paddings al objeto `style`.
3.  **Dynamic Update Pattern:** No intentes esperar a los datos para el primer renderizado. Inyecta la estructura básica (Placeholder) y usa una segunda llamada a `nube.render` dentro de la promesa del `fetch` para actualizar el contenido. El SDK maneja eficientemente el "diffing".

🎉 **Estado:** La Fase 9 de pulido visual y la Fase 10 de descargas dinámicas han sido completadas exitosamente.
