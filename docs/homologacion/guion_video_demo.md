# Guion para Video de Demostración (Review de Tiendanube)

Para aprobar tu aplicación, Tiendanube requiere verla en acción simulando los casos de uso básicos que haría cualquier comerciante y comprador. 

Graba tu pantalla (puedes usar herramientas como Loom o OBS) siguiendo este guion paso a paso. No necesitas narrarlo con voz (aunque ayuda), simplemente sigue esta secuencia visual.

---

### Escena 1: Instalación desde el Panel de Tiendanube
**Objetivo:** Demostrar cómo una tienda inicia el onboarding y acepta los permisos correspondientes.

1.  **Inicio:** Abre tu tienda de desarrollo en el panel de administrador de Tiendanube (Administrador Tiendanube > Aplicaciones).
2.  **Acción:** Haz clic en tu app (ZeroCart) simulando que la encuentras en la App Store, y dale a **"Instalar aplicación"**.
3.  **Permisos (Importante):** Detente 2 segundos en la pantalla de "Permisos" para que el evaluador lea los *scopes* solicitados. Acepta los términos.
4.  **Cierre Escena:** Muestra cómo te redirige automáticamente al Dashboard de ZeroCart (tu panel frontend) ya autenticado ("Magical Login").

### Escena 2: Configuración del Producto (Vincular Google Drive)
**Objetivo:** Demostrar cómo el dueño de la tienda utiliza tu panel de administración (Frontend React).

1.  **Inicio:** Ya dentro del *Dashboard de ZeroCart*, debe mostrarse la lista de productos traídos de Tiendanube.
2.  **Acción:** Haz clic en un producto (Ej: "Ebook Marketing Digital PDF").
3.  **Configuración:** En el campo de URL o archivo, pega un enlace real de **Google Drive**.
4.  **Guardado:** Presiona el botón de "Guardar/Vincular". 
5.  **Cierre Escena:** Muestra el mensaje de éxito o que el producto ahora figura como "Vinculado / Activo".

### Escena 3: Simulación de Compra en la Tienda (Comprador Final)
**Objetivo:** Mostrar cómo funciona la inyección de `buy-now.js` y cómo la app cumple su propósito final con NubeSDK.

1.  **Inicio:** Abre en otra pestaña tu tienda de cara al cliente (el *Storefront*).
2.  **Acción (Front):** Visita la página del producto digital que acabas de configurar. Muestra claramente que el botón nativo de "Agregar al carrito" fue reemplazado exitosamente por tu botón inyectado de **"Comprar Ahora"** (1-Click).
3.  **Acción (Checkout):** Haz clic en "Comprar Ahora". Deja que redirija directamente a `/checkout/v3/start/...` ignorando el carrito. Ingresa datos ficticios pero coherentes y selecciona un método de pago rápido (Ej: Custom payment / Test mode). Completa el pago.
4.  **Página de Gracias (Importante):** Deja que Tiendanube cargue la pantalla de Gracias. Muestra el bloque generado por **NubeSDK** anunciando la descarga del archivo. 
5.  **Prueba final:** Haz clic en tu enlace de "Descargar PDF" de la página de gracias y muestra cómo lleva al usuario a su archivo de Google Drive correctamente.

### Escena 4: Muestra de Respaldo por Correo (Webhook Fallback)
**Objetivo:** Mostrar al evaluador que el sistema de backend reacciona a los webhooks correctamente.

1.  Abre la bandeja de entrada del correo ficticio que utilizaste para la prueba anterior.
2.  Abre el mensaje automático enviado por ZeroCart. Muestra que tiene el botón de descarga o el link incrustado y funciona.

### Escena 5: Desinstalación (Flujo Limpio)
**Objetivo:** Verificar que Tiendanube pueda remover el script y desvincular al usuario exitosamente si el cliente abandona tu app.

1.  **Inicio:** Vuelve al Panel de Administrador de Tiendanube > Mis Aplicaciones.
2.  **Acción:** Busca ZeroCart y haz clic en "Desinstalar". 
3.  **Confirmación:** Confirma la desvinculación. 
4.  **Cierre General:** Vuelve a actualizar la página de tu producto en el *Storefront* de la Tienda de prueba. Debe mostrarse el botón anterior original ("Agregar al Carrito/Comprar") sin rastros de tu script `buy-now.js`.
