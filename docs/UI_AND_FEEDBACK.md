# 🎨 UI, Feedback y Estados de Configuración

Este documento detalla el funcionamiento del sistema de feedback visual, los estados de configuración (Activo/Inactivo) y la lógica de persistencia implementada para mejorar la experiencia del usuario (Premium UX).

## 1. Sistema de Notificaciones (Toasts)

Utilizamos la librería **sonner** para gestionar notificaciones elegantes y no intrusivas.

### Configuración Global
- **Archivo**: `frontend/src/App.tsx`
- **Componente**: `<Toaster position="top-right" richColors closeButton />`

### Puntos de Implementación (Frontend)
- **Configuración de 1 Click**: Notifica éxito al guardar colores, textos o estado del switch.
- **Página de Gracias**: Notifica éxito al guardar el mensaje de agradecimiento o estado.
- **Gestión de Productos**: 
  - `saveLink`: Notifica "Enlace de producto actualizado correctamente".
  - `fetchProducts`: Notifica "Productos sincronizados correctamente" al usar el botón de Sincronizar.

## 2. Estados de Activación (Status Badges)

Para dar claridad sobre qué funciones están activas en la tienda del cliente, implementamos etiquetas de estado vibrantes.

### Componente: `StatusBadge`
- **Archivo**: `frontend/src/components/StatusBadge.tsx`
- **Estilos**:
  - **ACTIVO**: `#00C853` (Verde Vibrante) + Sombra de acento.
  - **INACTIVO**: `#FF3B30` (Rojo Vibrante) + Sombra de acento.
- **Efecto**: Incluye un anillo blanco pulsante (`animate-pulse`) para indicar que el estado es "en vivo".

### Ubicación Contextual
Las etiquetas se encuentran directamente al lado de los interruptores (Switch) en:
- `OneClickConfig.tsx`
- `ThankYouConfig.tsx`

## 3. Lógica de Persistencia y Conexión

Es crítico que los cambios realizados por el usuario se mantengan al navegar entre pestañas o recargar la página.

### Flujo de Datos
1. **Frontend**: Los componentes usan `useEffect` para llamar a `/api/config` al montarse.
2. **Backend**: `config.controller.ts` maneja las peticiones.
3. **Persistencia (IMPORTANTE)**: El método `getStoreConfig` en el backend utiliza Prisma para consultar la tabla `Store`.

### Campos Críticos de 1 Click
Para que el estado persistiera, se debieron incluir explícitamente estos campos en el `select` de Prisma en el backend:
- `oneClickEnabled`
- `oneClickText`
- `oneClickBgColor`
- `oneClickTextColor`
- `oneClickSize`

> [!WARNING]
> Si se agregan nuevos campos de configuración en el futuro, **deben agregarse** tanto al `select` de `getStoreConfig` como al `data` de `updateStoreConfig` en `backend/src/controllers/config.controller.ts`.

## 4. Valores Predeterminados (Fallback)

Para asegurar una UI "Premium" desde el primer uso, se definieron valores por defecto:
- **Botón 1 Click**: Fondo `#006EFF` (Azul Zerocart), Letras `#FFFFFF`.
- **Texto del Botón**: "Comprar ahora" (se muestra si el campo está vacío en la base de datos).

---
*Si algo se rompe en la visualización de estados, revisa primero la respuesta de `/api/config` en la consola de red para verificar que el backend esté enviando todos los campos booleanos correctamente.*
