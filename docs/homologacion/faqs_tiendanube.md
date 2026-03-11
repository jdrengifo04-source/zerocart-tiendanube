# Tutorial de Instalación y FAQs de ZeroCart

*(Nota: Copiar el texto desde este punto hacia abajo e insertarlo directamente en un documento de Google Docs para compartirlo. El formato de títulos (H1, H2) se transcribirá automáticamente en la estructura de Google Docs).*

---

# Empezando con ZeroCart

¡Bienvenido a ZeroCart! Esta guía resolverá la mayoría de las inquietudes que puedes tener a la hora de automatizar la entrega de tus productos digitales, e-books y accesos con Tiendanube.

## Visión General
ZeroCart es la principal aplicación en la región para transformar Tiendanube en una plataforma potente de venta de Infoproductos. Reemplazamos el complejo carrito de compras por un botón de "Comprar Ahora" e inyectamos la entrega inmediata (NubeSDK) directo en tu página de confirmación de compra ("Thank You Page").


## Paso 1: Instalación de la Aplicación

1.  Inicia sesión en el administrador de tu Tiendanube.
2.  Visita la sección mis aplicaciones e ingresa a la Tienda de Aplicaciones de Tiendanube.
3.  Busca **ZeroCart** y haz clic en Instalar.
4.  Se abrirá una pestaña pidiéndote confirmar ciertos permisos (como ver tus productos e inyectar scripts en la UI). Aprueba estos permisos.
5.  Una vez instalada, serás redirigido a tu panel principal de ZeroCart. Todo el ingreso será mediante inicio de sesión "mágico" (automático) sin pedirte usuario ni contraseña.


## Paso 2: Vincular Enlaces de Descarga (Google Drive)

Antes de que ZeroCart automatice todo por ti, debemos indicarle al sistema qué archivo le pertenece a qué producto de tu catálogo en Tiendanube.

1.  **Crea tu producto en Tiendanube:** Añade todas las fotos, descripciones e inventario en cero. Tip: Márcalo como “No requiere envío”.
2.  **Accede a ZeroCart:** Desde el Administrador de Tiendanube entra a tus Aplicaciones, o haz clic en un acceso directo.
3.  **Sube tu Archivo a Google Drive:** Toma el PDF o la carpeta completa del cliente, súbela a tu espacio de Google Drive.
4.  Asegúrate de cambiar los permisos del archivo a **“Cualquier persona con el enlace”** como Lectura.
5.  **Copia el Link de Google Drive.**
6.  **Pega el Link en ZeroCart:** En el tablero de ZeroCart, encontrarás el producto de Tiendanube que habías creado. Simplemente pega el link de Drive en el campo respectivo y guárdalo. ¡Eso es todo! El botón de la tienda se inyectará instantáneamente.


---

# Preguntas Frecuentes (FAQs)

### ¿Cómo sé que la aplicación está funcionando?
Solo tienes que ingresar a la versión pública de tu tienda y entrar en un producto que hayas vinculado. Mágicamente, el botón de "Agregar Carrito" que existía previamente habrá desaparecido y, en su lugar, se inyectó el botón de "Comprar Ahora".

### ¿Qué sucede si el cliente falla en descargar el archivo luego de pagar?
Si tu cliente cerró la pestaña del comprobante de pago (“Página de confirmación”) demasiado rápido, ¡no debes preocuparte! Hemos creado la red de seguridad de **Webhook Fallback**. Apenas Tiendanube confirma que el dinero de la orden ingresó correctamente, ZeroCart le redacta de forma automática y silenciosa un correo electrónico transaccional con su copia de los accesos de por vida.

### ¿Cambia algo en mis pasarelas de pago al usar el "1 Clic"?
No. ZeroCart solo acelera el proceso hacia el checkout. Nuestro script lee la variable que está viendo el cliente y lo empuja directamente a la ruta segura oficial (`/checkout/v3/...`) usando tus pasarelas de cobro exactamente tal como las configuraste en la sección original. Nosotros no tocamos tu dinero.

### ¿Afectará a mis productos físicos en tienda?
**En lo absoluto**. ZeroCart solo reemplazará el botón de tu tienda (inyectando el "1 Click") *exclusivamente en aquellos productos en los cuales hayas pegado links de acceso* dentro del dashboard de la aplicación. Todo producto o remera que no incluyas allí seguirá teniendo el carrito de compras nativo original.

### ¿La aplicación puede entorpecer la carga de mi web de Tiendanube?
Nuestro inyector cuenta con carga diferida. Además de alojarnos en servidores y sistemas CDN muy veloces, la lógica se inyecta por detrás haciendo que toda tu velocidad permanezca intacta. 

### ¿Cómo funciona la Suscripción y los métodos de pago de ZeroCart?
Tienes **7 días gratuitos**. A partir de ese momento, el servicio tiene un valor congelado de **$22,900 COP / mes**.  ZeroCart, aliado verificado de la plataforma, está totalmente acoplado con el sistema de *Billing de Tiendanube.* Por lo que la cuota de suscripción entrará silenciosa y automáticamente en la misma boleta de pago de Tiendanube mes a mes, sin que pongas tu tarjeta en distintas plataformas ajenas.

### Intenté desinstalarla, pero el botón de mi tienda se quedó inyectado.
Esto es imposible usando los flujos oficiales. Asegúrate de desinsalar la App usando el botón de la sección "Mis Aplicaciones" dentro del panel general de administrador de tu Tiendanube. Tiendanube disparará un Webhook a nuestras bases de datos indicándonos que nos has abandonado, y se retirarán todos nuestros Scripts y registros instantáneamente.
