(function () {
    console.log('📦 Zerocart: Intentando cargar loader en Checkout V3 (con debug avanzado)...');

    function getStoreId() {
        try {
            // 1. Tiendanube inyecta los scripts con el parámetro "?store=XXXX"
            if (document.currentScript && document.currentScript.src) {
                var match = document.currentScript.src.match(/[?&]store=(\d+)/);
                if (match && match[1]) {
                    console.log('✅ Zerocart Debug: Store ID encontrado en currentScript');
                    return match[1];
                }
            }

            // 2. Buscar en todos los scripts de la página
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src && scripts[i].src.indexOf('store=') !== -1) {
                    var matchParams = scripts[i].src.match(/[?&]store=(\d+)/);
                    if (matchParams && matchParams[1]) {
                        console.log('✅ Zerocart Debug: Store ID encontrado iterando scripts');
                        return matchParams[1];
                    }
                }
            }

            // 3. Fallbacks del Storefront clásico (robustecidos contra null)
            if (typeof window !== 'undefined') {
                if (window.TiendaNube && window.TiendaNube.storeId) return window.TiendaNube.storeId;
                if (window.LS && window.LS.store && window.LS.store.id) return window.LS.store.id;
                if (window.Checkout && window.Checkout.storeId) return window.Checkout.storeId;
            }

            // Cuidado con `typeof store` si `store` es null (typeof null === 'object')
            if (typeof store !== 'undefined' && store !== null && store.id) {
                return store.id;
            }

            return null;
        } catch (err) {
            console.error('❌ Zerocart Debug: Error capturado en getStoreId:', err);
            return null; // Fallback gracefully if any evaluation throws
        }
    }

    try {
        var storeId = getStoreId();

        if (!storeId) {
            console.error('❌ Zerocart: No se pudo auto-detectar el Store ID en el Checkout.');
            // Fallback para tu ID mientras depuramos
            storeId = '7317678';
            console.warn('⚠️ Zerocart: Fallback al Store ID manual activado:', storeId);
        } else {
            console.log('✅ Zerocart: Store ID detectado exitosamente en Checkout:', storeId);
        }

        var scriptUrl = 'https://zerocart.jrengifo.com/api/scripts/buy-now.js?store_id=' + storeId + '&v=' + new Date().getTime();

        var xhr = new XMLHttpRequest();
        xhr.open('GET', scriptUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log('✅ Zerocart: Script buy-now.js descargado vía XHR.');
                    var s = document.createElement('script');
                    s.type = 'text/javascript';
                    s.text = xhr.responseText;
                    document.documentElement.appendChild(s);
                    console.log('📦 Zerocart: Etiqueta <script> ejecutada en el DOM (XHR).');
                } else {
                    console.warn('❌ Zerocart: Error al cargar buy-now.js HTTP ' + xhr.status);
                }
            }
        };
        xhr.onerror = function () {
            console.warn('❌ Zerocart: Error de red al cargar buy-now.js vía XHR.');
        };
        xhr.send();
    } catch (e) {
        console.error('❌ Zerocart Debug: Error global en el loader:', e);
    }
})();
