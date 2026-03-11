# Plan de Homologación y Publicación: ZeroCart en Tiendanube

Este plan integra los requerimientos técnicos y de homologación detectados en la arquitectura de **ZeroCart** con los requerimientos obligatorios de publicación de la **App Store de Tiendanube**. 

*Nota: Este formato está optimizado para facilitar su copiado y pegado directo en Google Docs.*

---

## 1. Fase de Homologación (Artefactos de Análisis)

El equipo de Tiendanube requiere validar técnicamente la app antes de permitir su listado público. 

### 1.1 Diagrama de Secuencia y Alcances (Scopes)
- **Objetivo:** Justificar el uso de los permisos `Products`, `Scripts`, `Orders`, y `Customers`.
- **Acción:** Crear un diagrama con Mermaid.js que muestre 3 flujos clave:
  1. **Instalación (OAuth):** Flujo de obtención de tokens y Customer.
  2. **Flujo "1 Click $" (`buy-now.js`):** Interacción del script inyectado (justifica `Scripts`) y consulta de variantes/precios (justifica `Products`).
  3. **Generación NubeSDK y Fallback:** Lectura de la orden en la Página de Gracias (justifica `Orders`) y envío de webhook por email.

### 1.2 Video de Demostración
- **Objetivo:** Demostrar visualmente que la aplicación cumple con los flujos esperados sin errores.
- **Acción:** Crear un **Guion de Videoclips/Storyboard** paso a paso para que el usuario pueda grabar su pantalla mostrando:
  - Instalación a través del Panel de Partners de Tiendanube.
  - Aceptación de pantalla de Permisos.
  - Autorización mágica en el dashboard de ZeroCart.
  - Simulación de una compra completa (Checkout V3, inyección del botón, y redirección a la Página de Gracias con NubeSDK).
  - Desinstalación de la app y reinstalación.

### 1.3 Explicación del Ciclo de Suscripción (Billing Tiendanube)
- **Objetivo:** Aclarar a Tiendanube cómo funciona el modelo de suscripción mensual recurrente y qué sucede si hay falta de pago.
- **Detalles Técnicos y Sugerencia:** Como usaremos el **Billing nativo de Tiendanube**, el cobro está anclado a su factura. 
  - El modelo: **$22,900 COP al mes con 7 días de prueba GRATIS** cobrados a través de Tiendanube.
  - **Penalización sugerida:** Si el merchant no paga su tienda o la app, Tiendanube restringe el acceso y nos envía un Webhook (`app/uninstalled` o similar). Nuestra DB simplemente marcará la tienda como inactiva y el script dejará de inyectar el botón de 1-Click. No tenemos que hacer gestión manual de cobros.
- **Acción:** Redactar un documento explicando esta lógica técnica.

---

## 2. Fase de Publicación (Perfil en la App Store)

Una vez aprobada la tecnología, la app debe verse confiable y atractiva. 

### 2.1 Datos Principales de la Aplicación
- **Nombre de la aplicación:** ZeroCart
- **Forma de Cobro:** Precio por mes (billing externo/recurrente).
- **Precio:** $22,900 COP / mes.
- **Prueba Gratuita:** 7 días.

### 2.2 Assets Gráficos Obligatorios
*(Nota: Estos assets ya fueron creados y subidos a la plataforma por lo que no requieren acción, se mantienen aquí como contexto del proyecto).*
- **Icono de la aplicación:** 600 x 600 px (Logo oficial de ZeroCart).
- **Banners Promocionales:** 1600 x 800 px.

### 2.3 Textos del Perfil de la App (Contexto)
*(Nota: Estos textos ya fueron creados y subidos a la plataforma. Quedan aquí documentados como referencia oficial para otros agentes).*

**Descripción Breve:**
Aumenta tus ventas de PDFs con compras en 1 clic. Salta el carrito y entrega tus archivos digitales al instante de forma automática.

**Descripción Larga:**
Vende más infoproductos eliminando la fricción de compra. ZeroCart transforma tu Tiendanube automatizando tus entregas digitales.

**Beneficios para tu tienda:**
- **Compras en 1 clic:** Cambia "Agregar al carrito" por "Comprar Ahora". Envía al cliente directo al checkout y reduce abandonos.
- **Entrega automática e inmediata:** Tus clientes reciben sus PDFs o links de Google Drive en la página de gracias tras pagar. Cero esperas.
- **Ahorro de tiempo total:** Olvídate de enviar accesos manualmente. ZeroCart opera como tu motor invisible 24/7.
- **Experiencia premium:** Simplifica el proceso de compra y aumenta la confianza de tus usuarios.
Prueba ZeroCart gratis por 7 días y escala tu negocio digital hoy.

### 2.4 Plantilla de FAQs y Guía de Uso
- **Objetivo:** Resolver las dudas del merchant sin que sobrecargue el soporte.
- **Acción:** Crear un documento Markdown formateado limpiamente para que sea **fácil de copiar y pegar en Google Docs**. Incluirá el tutorial de instalación, vinculación de Drive y preguntas frecuentes estándar de Tiendanube.

---

## 3. Configuración en el Panel de Partners
*(Completado por el usuario)*

---

## 🛠 Entregables a Generar
*A continuación se generarán los siguientes documentos que necesitas enviar al equipo de Tiendanube:*
1. **Diagrama de Secuencia y Scopes** (Código Mermaid.js).
2. **Guion del Video de Demostración** (Paso a paso para grabar).
3. **Documento del Ciclo de Facturación** (Explicando la integración con su Billing).
4. **Documento de FAQs y Guía de Uso** (Formato limpio para Google Docs).
