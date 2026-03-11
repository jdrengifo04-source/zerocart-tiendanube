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
- ✅ **Premium Redesign v26.1 (Marzo 2026)**: Implementación de flujo "Página de Gracias" vía NubeSDK con diseño premium y descargas dinámicas desde el backend.
- 🔄 (En curso) Implementación de sistema multi-tienda (persistencia de tokens por tienda).
- 🔄 (Pendiente) Flujo completo de cobro de comisiones vía Webhooks.

- **Async UI**: Inicia el renderizado con datos locales (placeholder) y actualiza con `nube.render` una vez que el `fetch` al backend resuelva los datos reales del producto.
- **Versión de Tiendanube vs Interna**: Tiendanube tiene un contador interno de "Versiones" (ej. v13, v25) que incrementa cada vez que subes un archivo. **Nuestra versión interna** (ej. V32) se escribe en los logs de la consola (`[ZeroCart] 🛡️ Checkout Extension V32...`) para poder identificar qué código está corriendo realmente.

## 🔗 Enlaces de Acceso Rápido
- **URL de Instalación Tiendanube (OAuth):** [https://www.tiendanube.com/apps/27012/authorize](https://www.tiendanube.com/apps/27012/authorize) *(Usa este enlace para instalar la app en tiendas de prueba o producción)*

## 📁 Documentación Detallada
- [Arquitectura Detallada](docs/ARCHITECTURE.md)
- [Solución Redirección One-Click](docs/ONE_CLICK_CHECKOUT.md)
- [Arquitectura NubeSDK (Checkout V3 Web Worker)](docs/NUBESDK_ARCHITECTURE.md)
- [Extensión Checkout V3 (NubeSDK)](docs/NUBE_SDK_EXTENSION.md)
- [🎨 UI, Feedback y Estados](docs/UI_AND_FEEDBACK.md)
- [Guía de Despliegue y Ops](docs/DEPLOYMENT.md)
- [Flujo de Tiendanube (Auth & Webhooks)](docs/TIENDANUBE.md)


## 📘 Guía Técnica: Botón "1 Click" (Comprar Ahora) y Página de Gracias

### 💡 Aprendizajes Críticos (Quick Ref para el futuro)
- **Navegación V3**: No usar query params directos para el checkout (`?add_to_cart`). Siempre usar el flujo AJAX.
- **Entorno Restringido**: No existe `document` en el Checkout. Toda la UI es declarativa vía `nube.render`.
- **Versionado**: Ignorar el contador de Tiendanube; verificar la versión en el log de consola (`V32-FinalFix`).

## 📁 Documentación Detallada (Click para ver detalles)
- [🏗️ Arquitectura General](docs/ARCHITECTURE.md): Flujo de datos, Prisma, y sistema de versionado.
- [🛒 One-Click Checkout (Botón Buy Now)](docs/ONE_CLICK_CHECKOUT.md): Detalles del flujo AJAX `/comprar/` y solución al error 404.
- [🎉 Extensión de Checkout (Página de Gracias)](docs/NUBE_SDK_EXTENSION.md): Arquitectura NubeSDK, manejo de estado V32 y prevención de parpadeo.
- [🌐 Guía de Tiendanube](docs/TIENDANUBE.md): OAuth, Scopes y Webhooks.
- [🎨 UI y Feedback](docs/UI_AND_FEEDBACK.md): Funcionamiento de estados Activo/Inactivo y sistema de Toasts.
- [🚀 Despliegue y Ops](docs/DEPLOYMENT.md): Docker, Hostinger y EasyPanel.

---

### Resumen Técnico de Decisiones Críticas

#### 1. Botón "Comprar Ahora" (1 Click $)
Para evitar carritos vacíos y errores 404, el sistema inyecta un botón que realiza un `POST` previo a `/comprar/` para obtener los tokens de sesión (`id` y `token`) antes de redirigir a `/checkout/v3/start/`.
> Ver detalle en: [ONE_CLICK_CHECKOUT.md](docs/ONE_CLICK_CHECKOUT.md)

#### 2. Página de Gracias (V32 Final Fix)
Debido a que el Checkout V3 corre en un Web Worker, se eliminaron todas las referencias a `document`. Se implementó un control de estado (`lastRenderedOrderId`) para evitar que la página parpadee infinitamente durante los re-renderizados de Tiendanube.
> Ver detalle en: [NUBE_SDK_EXTENSION.md](docs/NUBE_SDK_EXTENSION.md)

#### 3. Fallback de Entrega
Ante cualquier falla o cierre prematuro de la UI del checkout, el cliente puede volver a acceder a la Página de Confirmación desde el correo de compra estándar que envía automáticamente Tiendanube, donde el botón de descarga volverá a inicializarse.

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
