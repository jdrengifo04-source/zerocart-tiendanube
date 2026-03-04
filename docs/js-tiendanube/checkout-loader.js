(function () {
    // 🛡️ Capturamos referencias globales síncronamente antes de que el entorno asíncrono (Sandbox/XHR Mock de Tiendanube) las elimine.
    var _doc = typeof document !== 'undefined' ? document : null;
    var _win = typeof window !== 'undefined' ? window : null;

    console.log('📦 Zerocart: Intentando cargar loader en Checkout V3 (con debug avanzado y Bypass de Sandbox)...');

    function getStoreId() {
        try {
            // 1. Tiendanube inyecta los scripts con el parámetro "?store=XXXX"
            if (_doc && _doc.currentScript && _doc.currentScript.src) {
                var match = _doc.currentScript.src.match(/[?&]store=(\d+)/);
                if (match && match[1]) {
                    console.log('✅ Zerocart Debug: Store ID encontrado en currentScript');
                    return match[1];
                }
            }

            // 2. Buscar en todos los scripts de la página
            if (_doc) {
                var scripts = _doc.getElementsByTagName('script');
                for (var i = 0; i < scripts.length; i++) {
                    if (scripts[i].src && scripts[i].src.indexOf('store=') !== -1) {
                        var matchParams = scripts[i].src.match(/[?&]store=(\d+)/);
                        if (matchParams && matchParams[1]) {
                            console.log('✅ Zerocart Debug: Store ID encontrado iterando scripts');
                            return matchParams[1];
                        }
                    }
                }
            }

            // 3. Fallbacks del Storefront clásico (robustecidos contra null)
            if (_win) {
                if (_win.TiendaNube && _win.TiendaNube.storeId) return _win.TiendaNube.storeId;
                if (_win.LS && _win.LS.store && _win.LS.store.id) return _win.LS.store.id;
                if (_win.Checkout && _win.Checkout.storeId) return _win.Checkout.storeId;
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
                    var s = _doc.createElement('script');
                    s.type = 'text/javascript';
                    s.text = xhr.responseText;
                    _doc.documentElement.appendChild(s);
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
