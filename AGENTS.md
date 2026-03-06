# Zerocart - Guía para Agentes y Desarrolladores

Bienvenido a **Zerocart**, una solución de automatización para la entrega de productos digitales en Tiendanube. Este documento sirve como punto de entrada para entender la arquitectura, el estado actual y cómo contribuir al proyecto.

## 🚀 Misión del Proyecto
Permitir a los dueños de tiendas Tiendanube vender contenido digital (PDFs, cursos, enlaces) con entrega instantánea una vez confirmado el pago, cobrando una comisión por transacción.

## 🏗️ Arquitectura del Sistema
El proyecto es un monorepo simplificado:

- **/frontend**: Aplicación React + Vite + Tailwind CSS. Es el panel de administración donde el usuario vincula sus productos con enlaces de Google Drive.
- **/backend**: API Node.js + Express + TypeScript.
  - **Prisma ORM**: Gestiona la base de datos PostgreSQL.
  - **Tiendanube API Integration**: Maneja la comunicación con la plataforma (productos, webhooks, scripts).
  - **Public Scripts**: Contiene `buy-now.js`, el script inyectable que modifica el comportamiento del botón de compra en las tiendas de los clientes.

## 🛠️ Stack Tecnológico
- **Lenguaje**: TypeScript (Frontend y Backend).
- **Backend**: Express con ESM (módulos ES).
- **Base de Datos**: PostgreSQL (conectado vía Prisma).
- **Despliegue**: Docker + EasyPanel en VPS (Hostinger).
- **Dominio**: `zerocart.jrengifo.com`

## 📍 Estado Actual (Marzo 2026)
- ✅ Infraestructura de despliegue configurada y funcional.
- ✅ Frontend servido exitosamente por el backend en producción.
- ✅ Refactorización Monolítica Completada: UI modular (Sidebar, ProductCard, OneClickConfig).
- ✅ Integración con Tiendanube consolidada:
  - Extracción de `price` y `promotional_price` desde `variants`.
- ✅ Implementación visual "1 Click $": Vista Previa Móvil dinámica usando datos reales de la tienda.
- ✅ Integración DB/API "1 Click $": Configuración guardada en PostgreSQL vía Prisma. Función de autoinyección del Script dinámico vía API de Tiendanube.
- ✅ Redirección Directa a Checkout: Solucionado el error de carrito vacío mediante flujo AJAX al endpoint `/comprar/`, permitiendo redirección directa a la URL final de pago (`/checkout/v3/start/...`).
- ✅ Permisos de Tiendanube configurados: Identificados y habilitados los alcances necesarios (Products, Scripts, Orders, Customers) para la próxima fase de Página de Gracias y Descarga de PDFs.
- 🔄 (En curso) Implementación de flujo "Página de Gracias" vía NubeSDK (Checkout Extension V3) aislando React en un Web Worker.
- 🔄 (En curso) Implementación de sistema multi-tienda (persistencia de tokens por tienda).
- 🔄 (Pendiente) Flujo completo de cobro de comisiones vía Webhooks.

## 📁 Documentación Detallada
- [Arquitectura Detallada](docs/ARCHITECTURE.md)
- [Solución Redirección One-Click](docs/ONE_CLICK_CHECKOUT.md)
- [Extensión Checkout V3 (NubeSDK)](docs/NUBE_SDK_EXTENSION.md)
- [Guía de Despliegue y Ops](docs/DEPLOYMENT.md)
- [Flujo de Tiendanube (Auth & Webhooks)](docs/TIENDANUBE.md)


## 📘 Guía Técnica: Botón "1 Click" (Comprar Ahora) y Página de Gracias

Esta sección documenta cómo funciona exactamente la inyección del botón "Comprar Ahora" y la "Página de Gracias", para poder diagnosticar y reparar si en el futuro algo se rompe debido a cambios en los temas de Tiendanube.

### 1. Arquitectura Central del Script Inyectado
El sistema funciona a través de un script de inyección configurado en el Portal de Partners de Tiendanube:
1. **Punto de Entrada**: La tienda carga un script estático o dinámico que nuestro backend provee a través del endpoint `/api/scripts/buy-now.js?store_id=XXXX`.
2. **Contexto**: El script se ejecuta en el navegador del comprador final.
3. **Restricción de Ambientes**: **Es crítico** que el script esté autorizado en el Portal de Partners para ejecutarse tanto en el entorno de la **Tienda (Storefront)** como en el **Checkout**, de lo contrario la página de gracias no funcionará.

### 2. Flujo Completo: Botón "Comprar Ahora" (1 Click $)
El objetivo es saltarse el carrito intermedio y enviar al cliente directo a pagar.

- **Detección del Botón Original**: El script busca el botón de "Agregar al carrito" nativo usando selectores comunes (Ej. `.js-addtocart`, `.js-prod-submit-form`).
- **Reemplazo Visual**: Oculta el botón nativo, oculta los selectores de cantidad (usando `.js-quantity`) e inyecta un nuevo botón `id="zerocart-buy-now"` estilizado con la configuración de la base de datos de la tienda.
- **Acción (Click)**:
  1. Extrae el `Product ID` y `Variant ID` de los `<input>` ocultos del formulario nativo de Tiendanube o del objeto global `window.LS.product.id`.
  2. Realiza una petición `POST` AJAX en segundo plano hacia el endpoint relativo de la misma tienda: `/comprar/`. (Pasando el `add_to_cart=ID` y `quantity=1`).
  3. Tiendanube responde con un JSON que contiene la información del carrito recién creado (`cart_id` y `cart_token`).
  4. El script construye la URL de checkout directo: `/checkout/v3/start/{cart_id}/{cart_token}?from_store=1`.
  5. Finalmente, redirige al usuario a esa URL, logrando el flujo de "Un solo clic".

- **Respuesta y Renderizado (NubeSDK)**: Si el pedido es pago, el backend devuelve los enlaces. La extensión, corriendo dentro del **Web Worker** del Checkout, utiliza `nube.render("after_main_content", [...])` empleando objetos JSON que respetan el esquema estricto de `@tiendanube/nube-sdk-types`.

### 3. Estructura Exacta de Componentes NubeSDK (Checkout V3)
Debido a que el entorno restringe el uso de React/JSX directamente sin compilación compleja, si construyes los componentes a mano (como en Vanilla JS/TS compilado con tsup), debes usar la estructura **exacta** que espera la plataforma.

**Sintaxis Definitiva:**
Los objetos nativos NO usan `{ component: "Box", props: {} }`. La propiedad clave es `type` (en minúsculas), y el contenido se pasa en `children`.
```javascript
// ✅ CORRECTO:
{
  type: "box",
  background: "#f4f4f4",
  padding: "16px",
  children: [
     {
        type: "txt", // Textos van con type "txt" (mira types/components.ts)
        modifiers: ["bold"],
        children: "Descarga lista"
     },
     {
        type: "link",
        href: "https://drive.google.com/...",
        target: "_blank",
        children: "Descargar"
     }
  ]
}

// ❌ INCORRECTO:
{ component: "Box", props: { children: "..." } } // Falla silenciosamente o da "Component undefined"
{ type: "Box" } // Mayúsculas no reconocidas en "type"
```

*(Nota: El flujo antiguo vía inyección directa al DOM ya NO es viable en Checkout V3 debido a restricciones de seguridad. Toda interacción gráfica debe usar la librería `nube-sdk-jsx` compilada en un único archivo `index.global.js` o construyendo los objetos puros como se describe arriba).*

### 4. Flujo Alternativo: Entrega por Correo (Fallback)
Ante las estrictas limitaciones del Sandbox del Checkout V3 (que elimina el acceso al DOM), se desarrolló un plan B robusto:
- **Webhook**: Cuando la compra se completa, Tiendanube dispara el webhook `order/paid` hacia `/api/webhooks/order-paid`.
- **Detección de Productos Digitales**: El backend busca si los productos comprados tienen un enlace de Google Drive asociado en la base de datos de Zerocart.
- **Servicio de Email (`email.service.ts`)**: Si hay productos digitales, el backend utiliza `nodemailer` (configurado con SMTP o Resend en producción) para compilar una plantilla HTML.
- **Envío Automático**: El cliente recibe un correo instantáneo titulado "¡Tus productos digitales están listos!" (o el título personalizado de la tienda) con el botón directo a Google Drive, saltándose por completo la necesidad de modificar el frontend del checkout.

### 5. Key Learnings (Aprendizajes Clave)
- **Script Activation**: En el Portal de Partners, para inyectar scripts, usa el evento `onfirstinteraction`. El evento `onload` puede ser bloqueado o ejecutarse demasiado temprano en algunos temas.
- **Robust Selectors**: Los temas de Tiendanube varían mucho. Siempre busca por `.js-addtocart`, `.js-prod-submit-form` y selecciona el formulario padre más cercano para extraer la "Variante".
- **Comprar vs Cart Add**: Algunos temas usan directamente el `product_id` en `add_to_cart`. Usar el endpoint `/comprar/` con variables AJAX es mucho más estable que intentar enviar formularios estándar (que llevan al carrito).

### PowerShell Compatibility (Critical)
- **Windows PowerShell 5.1**: Does NOT support `&&` for chaining commands. 
- **Recommendation**: Run `git` commands sequentially or use `;` (e.g., `git add . ; git commit -m '...' ; git push`). 
- Avoid `&&` to prevent `ParserError: (:)` errors in the model's environment.

---
*Nota: Este archivo debe mantenerse actualizado por cada agente que realice cambios significativos en la estructura o el flujo principal.*
