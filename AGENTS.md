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
- 🔄 (En curso) Implementación de sistema multi-tienda (persistencia de tokens por tienda).
- 🔄 (Pendiente) Desarrollo de flujo "Página de Gracias" para entrega de PDFs vinculado al webhook de Orders.
- 🔄 (Pendiente) Flujo completo de cobro de comisiones vía Webhooks.

## 📁 Documentación Detallada
- [Arquitectura Detallada](docs/ARCHITECTURE.md)
- [Guía de Despliegue y Ops](docs/DEPLOYMENT.md)
- [Flujo de Tiendanube (Auth & Webhooks)](docs/TIENDANUBE.md)


## Tiendanube 1-Click Integration (Technical Guide)

### Core Architecture
1. **`loader.js`**: A static entry point that detects the `store_id` from global objects like `window.LS.store.id` or `window.TiendaNube.storeId`. It dynamically injects the real script from the backend.
2. **Backend Serving**: The dynamic script is served at `/api/scripts/buy-now.js?store_id=...`, which fetches the store's customization from the database and replaces the "Add to Cart" button.

### Key Learnings
- **Script Activation**: Use `onfirstinteraction` in the Tiendanube Partner Portal. `onload` can be blocked or execute too early.
- **Robust Selectors**: Tiendanube themes vary. Always check for `.js-addtocart`, `.js-prod-submit-form`, and `#product_form`.
- **Variant ID vs Product ID**: Some themes use `add_to_cart` as the product ID in their AJAX endpoints. Using `/comprar/` with `add_to_cart` is often more reliable than `/cart/add/` with `variant_id`.
- **Checkout URL Construction**: Direct redirection to checkout possible by constructing `/checkout/v3/start/{cart_id}/{cart_token}` using values returned from the AJAX add-to-cart response.

### Manual Actions Required
- Scripts MUST be registered manually in the Partner Portal initially (Script ID: #5084). API-based injection is currently unreliable without pre-authorized IDs.

---
*Nota: Este archivo debe mantenerse actualizado por cada agente que realice cambios significativos en la estructura o el flujo principal.*
