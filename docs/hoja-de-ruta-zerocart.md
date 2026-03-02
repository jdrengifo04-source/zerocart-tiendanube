# Proyecto Zerocart - Aplicación para Tiendanube

## 🎯 Visión General
**Zerocart** es una aplicación diseñada para el ecosistema de Tiendanube que elimina la fricción del proceso de compra ("Agregar al Carrito") facilitando un botón de **"Comprar Ahora"** (Direct Checkout). Adicionalmente, una vez completado el pago, reemplaza y personaliza la página de "Gracias por su compra" (Thank You Page) para distribuir instantáneamente archivos digitales (PDFs, GIFs, etc.) al consumidor final.

**Modelo de Negocio:** Monetización basada 100% en transacciones, ejecutando un cobro variable (ej. 15 centavos por venta) mediante las API nativas de Tiendanube, eliminando los costos mensuales fijos o de tipo SaaS para el comerciante.

---

## 🔗 Enlaces Oficiales Relevantes
- **Centro de Desarrolladores (DevHub):** [https://dev.tiendanube.com/](https://dev.tiendanube.com/)
- **Documentación principal de Tiendanube API:** [https://tiendanube.github.io/api-documentation](https://tiendanube.github.io/api-documentation)
- **App Templates (Plantillas base):** [Plantillas Web React/Node](https://dev.tiendanube.com/docs/developer-tools/templates)
- **Nimbus Design System (UI de Tiendanube):** [https://nimbus.tiendanube.com/](https://nimbus.tiendanube.com/)
- **Nexo:** [Herramienta para Iframe de Apps nativas](https://dev.tiendanube.com/docs/developer-tools/nexo)
- **API de Scripts (Para inyectar botón en vitrina):** [Documentación Scripts API](https://tiendanube.github.io/api-documentation/resources/script)
- **API de Webhooks (Para procesar órdenes/pagos):** [Documentación Webhooks API](https://tiendanube.github.io/api-documentation/resources/webhook)
- **API de Billing (Para ejecutar el cobro de 15¢):** [Documentación Billing API](https://tiendanube.github.io/api-documentation/resources/billing)

---

## 🚀 Hoja de Ruta: Pasos para la Creación de la Aplicación

### Paso 1: Configurar el Entorno del Socio (Partner)
1. Crear o acceder a una cuenta en el **Portal de Socios** de Tiendanube / Nuvemshop.
2. Crear una **App** (registrar la aplicación) en la plataforma para obtener las credenciales vitales: `Client ID` y `Client Secret`.
3. Crear una **Tienda de Prueba** para instalar la app en desarrollo y evitar afectar sitios en producción.

### Paso 2: Configuración Inicial de la Aplicación
1. **Selección de Plantilla:** Clona el repositorio base provisto por Tiendanube (e.g. `tiendanube-app-native-template-node` o plantilla React para aplicaciones nativas).
2. **Definir la arquitectura:** Seleccionar dónde se va a alojar (bases de datos como Supabase/Firestore y backend en Vercel, Node, o Google Cloud Run).
3. **Pila Tecnológica Administrativa:** Implementar el Administrador integrado (Embedded App). Usaremos **Nimbus Design System** para que se integre perfectamente con la interfaz de Tiendanube de tu cliente, y **Nexo** para manejar los flujos de comunicación y navegación.

### Paso 3: Flujo de Autenticación (OAuth 2.0)
1. Desarrollar e implementar el ruteo de autorización (OAuth).
2. Cuando el comerciante instale Zerocart, recibiremos un código que intercambiaremos por un `access_token`. 
3. *Importante:* Almacenar este `access_token` y asociarlo al ID único de la tienda de forma segura dentro de la base de datos (junto con el registro de sus configuraciones y archivos).

### Paso 4: Sustitución del Botón por "Comprar Ahora" (Inyección en la Tienda)
1. Desarrollar el JavaScript para el DOM de los comerciantes.
2. Mediante la **API de Scripts** de Tiendanube, inyectar el archivo de Script en la tienda que oculte el formulario original.
3. El script tendrá una petición `POST` AJAX al carrito de Tiendanube `/cart/add`. Tras retornar éxito (Status 200), debe redirigir inmediatamente a `window.location.href = '/checkout'`, logrando acortar el embudo.

### Paso 5: Página de Gracias Posventa y Distribución del Archivo Digital (PDF / GIF)
1. Desde el **Panel de Zerocart**, permitir que el comerciante cargue sus PDFs y se asocien el/los ID/s del producto (guardando en la BD).
2. Inyectar un segundo **Script** condicionado a la ejecución de la "Thank You Page". Este interceptará el objeto global `LS.order` de Tiendanube.
3. Registrar la aplicación al Webhook `order/paid` de Tiendanube. Al accionarse de forma asíncrona, nuestro servidor genera una URL firmada (autenticada y segura) del archivo, permitiendo la descarga en caso de que el pago esté confirmado, además de enviar copias por correo automatizado.

### Paso 6: Modelo de Facturación (Monetización)
1. Aprovechar la **Billing API`**, que permite el envío de cobros variables y transaccionales (`Extra Charges`).
2. Configurar la lógica para contabilizar la cantidad de entregas procesadas con éxito por el vendedor. 
3. *Mitigación Financiera:* Puesto que 15 centavos es una fracción marginal, la aplicación debe procesar las liquidaciones en lote (*Batch*). Por ejemplo, por cada X descargas exitosas completadas de PDFs/órdenes para la tienda asíncronamente, enviamos un cobro agregado de (X * $0.15) mediante un `POST /services/{service_id}/charges` detallando la cantidad de entregas.
4. Deshabilitar los modelos tradicionales de Software as a Service SaaS y establecer este en el backend.

### Paso 7: Revisión de Diseño y Homologación
1. Adecuar todas las configuraciones técnicas asegurando que pasen la lista de chequeo de *Homologación* de Tiendanube.
2. Desplegar la plataforma en producción.
3. Mandar la aplicación a auditoría para aparecer en la Tienda Oficial y hacer el debut.

---
*Este documento fue elaborado tomando como base la investigación previa de Tiendanube y las capacidades técnicas requeridas por la plataforma para modificar directamente las vistas del comprador garantizando la seguridad transaccional.*
