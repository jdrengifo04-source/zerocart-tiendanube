(function () {
    console.log('📦 Zerocart: Intentando cargar loader...');

    // Función para buscar el ID en varios lugares comunes de Tiendanube
    function findStoreId() {
        if (window.TiendaNube && window.TiendaNube.storeId) return window.TiendaNube.storeId;
        if (window.LS && window.LS.store && window.LS.store.id) return window.LS.store.id;
        if (window.LS && window.LS.storeId) return window.LS.storeId;
        return null;
    }

    var storeId = findStoreId();

    if (!storeId) {
        console.error('❌ Zerocart: No se pudo encontrar el Store ID en la ventana global.');
        return;
    }

    console.log('✅ Zerocart: Store ID encontrado:', storeId);

    var s = document.createElement('script');
    s.src = 'https://zerocart.jrengifo.com/api/scripts/buy-now.js?store_id=' + storeId;
    s.async = true;
    document.head.appendChild(s);
})();
