(function () {
    console.log('📦 Zerocart: Intentando cargar loader en Checkout V3...');

    function getStoreId() {
        // 1. Tiendanube inyecta los scripts con el parámetro "?store=XXXX"
        if (document.currentScript && document.currentScript.src) {
            var match = document.currentScript.src.match(/[?&]store=(\d+)/);
            if (match && match[1]) return match[1];
        }

        // 2. Buscar en todos los scripts de la página (por si acaso el paso anterior falla por carga asíncrona)
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.indexOf('store=') !== -1) {
                var matchParams = scripts[i].src.match(/[?&]store=(\d+)/);
                if (matchParams && matchParams[1]) return matchParams[1];
            }
        }

        // 3. Fallbacks del Storefront clásico (puede no existir en Checkout v3)
        if (window.TiendaNube && window.TiendaNube.storeId) return window.TiendaNube.storeId;
        if (window.LS && window.LS.store && window.LS.store.id) return window.LS.store.id;
        if (window.Checkout && window.Checkout.storeId) return window.Checkout.storeId;
        if (typeof store !== 'undefined' && store.id) return store.id;

        return null;
    }

    var storeId = getStoreId();

    if (!storeId) {
        console.error('❌ Zerocart: No se pudo auto-detectar el Store ID en el Checkout.');
        // Para asegurar que la página de gracias funcione en tu tienda mientras debuggeamos, usamos un fallback de tu ID:
        storeId = '7317678';
        console.warn('⚠️ Zerocart: Fallback al Store ID manual activado:', storeId);
    } else {
        console.log('✅ Zerocart: Store ID detectado exitosamente en Checkout:', storeId);
    }

    var s = document.createElement('script');
    s.src = 'https://zerocart.jrengifo.com/api/scripts/buy-now.js?store_id=' + storeId;
    s.async = true;
    document.head.appendChild(s);
})();
