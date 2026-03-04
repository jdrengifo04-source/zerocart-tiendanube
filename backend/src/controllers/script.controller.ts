import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const serveDynamicScript = async (req: Request, res: Response) => {
    try {
        const storeId = req.query.store_id as string;

        if (!storeId) {
            return res.status(400).send('console.error("Zerocart: Faltó indicar el store_id en el script");');
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: {
                oneClickEnabled: true,
                oneClickText: true,
                oneClickBgColor: true,
                oneClickTextColor: true,
                oneClickSize: true,
                thankYouHeadline: true,
                thankYouMessage: true,
                thankYouShowImage: true,
            }
        });

        if (!store || !store.oneClickEnabled) {
            // Si no existe la tienda o no está activada la opción
            return res.type('application/javascript').send('console.log("🚀 Zerocart: Función 1 Click $ deshabilitada para esta tienda.");');
        }

        const scriptContent = `
(function () {
    console.log('🚀 Zerocart: Botón "${store.oneClickText}" activado.');

    const ADD_TO_CART_SELECTORS = [
        '.js-addtocart',
        '.js-addtocart js-prod-submit-form',
        '.js-prod-submit-form',
        '.btn-add-to-cart',
        'input[type="submit"].js-addtocart',
        '#product_form input[type="submit"]',
        '[data-store="product-buy-button"]'
    ];

    const QUANTITY_SELECTORS = [
        '.js-quantity',
        '.form-group.js-quantity',
        '.form-quantity',
        '[data-component="product.quantity"]'
    ];

    function initBuyNow() {
        console.log('🔍 Zerocart: Buscando botón de compra...');
        let addToCartBtn = null;
        for (const selector of ADD_TO_CART_SELECTORS) {
            const btn = document.querySelector(selector);
            if (btn && btn.offsetParent !== null) { // Verificar que sea visible
                addToCartBtn = btn;
                console.log('✅ Zerocart: Botón encontrado con selector:', selector);
                break;
            }
        }

        if (!addToCartBtn) {
            // Reintentar en un momento si no se encuentra (algunos temas cargan dinámicamente)
            setTimeout(initBuyNow, 2000);
            return;
        }

        if (document.getElementById('zerocart-buy-now')) return;

        addToCartBtn.style.display = 'none';

        // Ocultar selector de cantidad (solo el elemento para no romper el grid)
        for (const qSelector of QUANTITY_SELECTORS) {
            const qElem = document.querySelector(qSelector);
            if (qElem) {
                console.log('✅ Zerocart: Selector de cantidad oculto:', qSelector);
                qElem.style.display = 'none';
            }
        }

        // Inyectar estilos para el botón y su contenedor
        const style = document.createElement('style');
        style.innerHTML = \`
            #zerocart-container {
                display: flex;
                width: 100%;
                margin: 20px 0;
                clear: both;
            }
            #zerocart-buy-now {
                width: 100%;
                padding: 18px 30px;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.2s, opacity 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                text-transform: uppercase;
                background-color: ${store.oneClickBgColor || '#007bff'};
                color: ${store.oneClickTextColor || '#ffffff'};
            }
            #zerocart-buy-now:hover {
                transform: translateY(-2px);
                opacity: 0.9;
            }
            @media (min-width: 768px) {
                #zerocart-container {
                    justify-content: flex-start;
                }
                #zerocart-buy-now {
                    width: auto;
                    min-width: 350px;
                }
            }
            @media (max-width: 767px) {
                #zerocart-container {
                    justify-content: center;
                }
            }
        \`;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'zerocart-container';

        const buyNowBtn = document.createElement('button');
        buyNowBtn.id = 'zerocart-buy-now';
        buyNowBtn.innerHTML = '⚡ ${store.oneClickText || 'Comprar Ahora'}';
        buyNowBtn.type = 'button';

        container.appendChild(buyNowBtn);
        
        // Insertar el contenedor después de la columna de añadir al carrito o en el formulario
        // Buscamos un contenedor más amplio para que el width: 100% funcione mejor
        const mainContainer = addToCartBtn.closest('form') || addToCartBtn.parentNode;
        mainContainer.appendChild(container);

        buyNowBtn.onclick = async function (e) {
            e.preventDefault();
            buyNowBtn.innerHTML = 'Procesando...';
            buyNowBtn.disabled = true;

            let productId = null;
            let variantId = null;
            const form = addToCartBtn.closest('form');
            
            if (form) {
                const variantInput = form.querySelector('input[name="variant_id"]');
                const addToCartInput = form.querySelector('input[name="add_to_cart"]');
                
                if (addToCartInput && addToCartInput.value) {
                    productId = addToCartInput.value;
                }
                if (variantInput && variantInput.value) {
                    variantId = variantInput.value;
                }
            }

            // Fallback para Product ID desde LS si no está en el form
            if (!productId && window.LS && window.LS.product) {
                productId = window.LS.product.id;
            }

            if (!productId) {
                console.error('❌ Zerocart: No se pudo identificar el Product ID.');
                alert('Lo sentimos, intenta con el botón normal.');
                addToCartBtn.style.display = 'block';
                buyNowBtn.remove();
                return;
            }

            console.log('🚀 Zerocart: Iniciando compra para Product ID:', productId);

            try {
                // Usamos /comprar/ porque es el endpoint que maneja la lógica de carrito en muchos temas
                const response = await fetch('/comprar/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new URLSearchParams({
                        'add_to_cart': productId,
                        'quantity': '1'
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Zerocart: Respuesta recibida:', data);

                    if (data.success && data.cart) {
                        const cartId = data.cart.id;
                        const cartToken = data.cart.token;
                        // Construimos la URL de checkout directo usando concatenación para evitar problemas con backticks
                        const checkoutUrl = '/checkout/v3/start/' + cartId + '/' + cartToken + '?from_store=1';
                        console.log('🔗 Zerocart: Redirigiendo a checkout:', checkoutUrl);
                        window.location.href = checkoutUrl;
                    } else if (data.cart && data.cart.abandoned_checkout_url) {
                        // Fallback a la URL de checkout abandonado si existe
                        console.log('🔗 Zerocart: Redirigiendo a abandoned_checkout_url');
                        window.location.href = data.cart.abandoned_checkout_url;
                    } else {
                        // Último recurso: URL de carrito normal
                        console.log('🔗 Zerocart: Redirigiendo a cartUrl fallback');
                        window.location.href = (window.LS && window.LS.cartUrl) ? window.LS.cartUrl : '/comprar/';
                    }
                } else {
                    throw new Error('Fallo en la API de Tiendanube');
                }
            } catch (error) {
                console.error('❌ Zerocart Error:', error);
                const fallbackUrl = (window.LS && window.LS.cartUrl) ? window.LS.cartUrl : '/comprar/';
                window.location.href = fallbackUrl;
            }
        };
    }

    function initThankYouPage() {
        if (!window.location.pathname.includes('/checkout/v3/success/')) return;
        
        console.log('🎉 Zerocart: Página de éxito detectada. Buscando detalles del pedido...');

        // Intentar obtener el ID del pedido de la URL
        // La URL suele ser /checkout/v3/success/ORDER_ID/ORDER_TOKEN
        const pathParts = window.location.pathname.split('/');
        const successIdx = pathParts.indexOf('success');
        const orderId = pathParts[successIdx + 1];

        if (!orderId) {
            console.error('❌ Zerocart: No se pudo encontrar el ID del pedido en la URL.');
            return;
        }

        const backendUrl = '${process.env.BACKEND_URL || ""}';
        const storeId = '${storeId}';

        fetch(backendUrl + '/api/order/details?order_id=' + orderId + '&store_id=' + storeId)
            .then(res => res.json())
            .then(data => {
                if (data.products && data.products.length > 0) {
                    renderDownloadCard(data);
                }
            })
            .catch(err => console.error('❌ Zerocart: Error al obtener links digitales:', err));
    }

    function renderDownloadCard(data) {
        if (document.getElementById('zerocart-thank-you')) return;

        console.log('✅ Zerocart: Renderizando tarjeta de descarga para', data.products.length, 'productos.');

        const style = document.createElement('style');
        style.innerHTML = \`
            .zerocart-thanks-card {
                background: #ffffff;
                border: 2px solid #e1e9ff;
                border-radius: 12px;
                padding: 25px;
                margin: 20px 0;
                box-shadow: 0 10px 25px rgba(0, 82, 255, 0.1);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                text-align: center;
            }
            .zerocart-thanks-headline {
                color: #1a1a1a;
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 10px;
                display: block;
            }
            .zerocart-thanks-message {
                color: #666;
                font-size: 16px;
                margin-bottom: 25px;
                display: block;
            }
            .zerocart-item-row {
                display: flex;
                align-items: center;
                background: #f8faff;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 15px;
                text-align: left;
                gap: 15px;
            }
            .zerocart-item-img {
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 8px;
            }
            .zerocart-item-info {
                flex-grow: 1;
            }
            .zerocart-item-name {
                font-weight: 700;
                color: #333;
                margin-bottom: 5px;
                display: block;
            }
            .zerocart-item-btn {
                background: #0052FF;
                color: white !important;
                padding: 10px 20px;
                border-radius: 6px;
                text-decoration: none !important;
                font-weight: 600;
                font-size: 14px;
                display: inline-block;
                transition: background 0.2s;
            }
            .zerocart-item-btn:hover {
                background: #0041cc;
            }
        \`;
        document.head.appendChild(style);

        const card = document.createElement('div');
        card.id = 'zerocart-thank-you';
        card.className = 'zerocart-thanks-card';

        let productsHtml = '';
        data.products.forEach(p => {
            productsHtml += \\\`
                <div class="zerocart-item-row">
                    \\\${data.config.showImage && p.image ? \\\`<img src="\\\${p.image}" class="zerocart-item-img" />\\\` : ''}
                    <div class="zerocart-item-info">
                        <span class="zerocart-item-name">\\\${p.name}</span>
                        <a href="\\\${p.googleDriveLink}" target="_blank" class="zerocart-item-btn">📥 DESCARGAR AHORA</a>
                    </div>
                </div>
            \\\`;
        });

        card.innerHTML = \`
            <span class="zerocart-thanks-headline">\${data.config.headline}</span>
            <span class="zerocart-thanks-message">\${data.config.message}</span>
            <div class="zerocart-products-list">
                \${productsHtml}
            </div>
        \`;

        // Tiendanube Checkout V3 suele tener un selector #checkout-header o .checkout-container
        const target = document.querySelector('.checkout-container') || document.querySelector('header') || document.body.firstChild;
        if (target === document.body.firstChild) {
            document.body.insertBefore(card, target);
        } else {
            target.prepend(card);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initBuyNow();
            initThankYouPage();
        });
    } else {
        initBuyNow();
        initThankYouPage();
    }
})();
`;

        res.type('application/javascript').send(scriptContent);
    } catch (error) {
        console.error('Error sirviendo script dinámico:', error);
        res.status(500).send('console.error("Error interno en Zerocart API");');
    }
};
