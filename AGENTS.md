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
- ✅ Integración básica con Tiendanube para listar productos.
- 🔄 (En curso) Implementación de sistema multi-tienda (persistencia de tokens por tienda).
- 🔄 (Pendiente) Flujo completo de cobro de comisiones vía Webhooks.

## 📁 Documentación Detallada
- [Arquitectura Detallada](docs/ARCHITECTURE.md)
- [Guía de Despliegue y Ops](docs/DEPLOYMENT.md)
- [Flujo de Tiendanube (Auth & Webhooks)](docs/TIENDANUBE.md)

---
*Nota: Este archivo debe mantenerse actualizado por cada agente que realice cambios significativos en la estructura o el flujo principal.*
