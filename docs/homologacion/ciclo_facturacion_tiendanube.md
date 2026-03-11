# Ciclo de Suscripción y Facturación - ZeroCart

Con el objetivo de ser 100% transparentes sobre el modelo de negocio y el sistema de comisiones, este documento describe el ciclo de facturación de ZeroCart para el equipo de homologación de Tiendanube.

## 1. Modelo de Precios

ZeroCart opera bajo un modelo de suscripción de cuota fija recurrente (App Fee), aprovechando el sistema nativo de facturación de Tiendanube.

*   **Periodo de Prueba Cautiva:** 7 días gratis.
*   **Cobro Mensual Fijo:** $22,900 COP / mes.
*   **Gestión del Cobro:** Todo el ciclo de facturación es gestionado automáticamente por la API de Billing de Tiendanube y se anexa a la factura mensual del comerciante.

## 2. Flujo de Suscripción

1.  El comerciante instala la aplicación y otorga los permisos necesarios (OAuth).
2.  Al ingresar a la aplicación por primera vez, el sistema redirige al merchant para que apruebe el cargo en el entorno seguro de Tiendanube.
3.  Una vez aprobado, comienzan a correr los 7 días de prueba. Tiendanube notificará al comerciante antes de hacer efectivo el primer cobro de la aplicación en su saldo/tarjeta registrada.

## 3. Manejo de Falta de Pago y Penalización (Webhooks)

Dado que ZeroCart utiliza el sistema de facturación integrado de la plataforma, depende por completo de las notificaciones oficiales (Webhooks) para la administración del estado de las tiendas.

### Flujo de Suspensión por falta de pago
*   Si el comerciante no abona la factura de Tiendanube (la cual incluye la mensualidad de la App), la plataforma emite un evento de restricción.
*   ZeroCart se encuentra suscrito a los webhooks oficiales (ej. `app/uninstalled` o `app/suspended`).
*   Al recibir el payload de suspensión de un `store_id` específico, nuestra base de datos (PostgreSQL) cambia inmediatamente el estado de ese comercio a `ACTIVA = false`.
*   **Resultado Operativo:** 
    *   No se renderizan accesos a los PDFs ni archivos.
    *   Nuestra API no procesará peticiones provenientes del Frontend de esa tienda.
    *   El script `buy-now.js` automáticamente se desactiva y restaura el comportamiento nativo del botón *"Agregar al carrito"* estándar, previniendo daños en el flujo de ventas normal de la tienda afectada.

### Flujo de Reactivación
*   Al momento de regularizar su pago, Tiendanube envía un nuevo Webhook notificando la reanudación del servicio (`app/resumed`).
*   El backend de ZeroCart cambia el estado a `ACTIVA = true`.
*   El botón de entrega en **1 Click** vuelve a funcionar inmediatamente para los productos digitales vinculados.

## 4. Política Promocional

Si existieran futuras aplicaciones del modelo de comisiones por transacción, ZeroCart se compromete a reportarlas activamente utilizando el endpoint de Tiendanube de cargos por uso (Usage Charges), garantizando que todo cobro siempre sea centralizado en la consola general que maneja el comerciante, manteniendo una experiencia transparente.
