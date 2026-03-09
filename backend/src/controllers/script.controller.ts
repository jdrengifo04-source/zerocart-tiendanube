import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const serveDynamicScript = async (req: Request, res: Response) => {
    try {
        const storeId = (req.query.store_id || req.query.store) as string;

        if (!storeId) {
            console.error('❌ Error: Falta store_id o store en la query', req.query);
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

        if (!store) {
            return res.status(404).send('console.error("Zerocart: Tienda no encontrada");');
        }

        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const hostUrl = process.env.BACKEND_URL || `${protocol}://${req.get('host')}`;

        const scriptContent = `
(function () {
    ${store.oneClickEnabled ? `console.log('🚀 Zerocart: Botón "${store.oneClickText}" activado.');` : 'console.log("🚀 Zerocart: Script cargado (Página de Gracias activa).");'}

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
        if (!${store.oneClickEnabled}) return;
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

        
        const buyBtn = document.createElement('button');
        buyBtn.id = 'zerocart-buy-now';
        buyBtn.innerText = '${store.oneClickText || 'COMPRAR AHORA'}';
        
        buyBtn.onclick = async function() {
            try {
                buyBtn.disabled = true;
                buyBtn.innerText = 'PROCESANDO...';
                
                const productForm = addToCartBtn.closest('form');
                let productId = '';
                
                if (productForm) {
                    const idInput = productForm.querySelector('input[name="add_to_cart"]');
                    if (idInput) productId = idInput.value;
                }
                
                if (!productId) {
                    const urlParts = window.location.pathname.split('-');
                    productId = urlParts[urlParts.length - 1].replace('/', '');
                }

                console.log('[ZeroCart] Initiating 1-Click for product:', productId);
                
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
                
                const cartData = await response.json();
                console.log('[ZeroCart] Cart created:', cartData);

                if (cartData.cart && cartData.cart.id && cartData.cart.token) {
                    // Flujo ideal: Redirect directo con tokens de V3
                    window.location.href = '/checkout/v3/start/' + cartData.cart.id + '/' + cartData.cart.token + '?from_store=1';
                } else if (cartData.cart && cartData.cart.abandoned_checkout_url) {
                    // Fallback 1: URL de checkout abandonado (que es v3 start)
                    window.location.href = cartData.cart.abandoned_checkout_url;
                } else {
                    // Fallback Final: Reintentar con el botón nativo si todo falla
                    console.warn('[ZeroCart] No tokens found, falling back to native flow.');
                    addToCartBtn.click();
                }
                
            } catch (err) {
                console.error('[ZeroCart] Error in 1-Click:', err);
                buyBtn.disabled = false;
                buyBtn.innerText = '${store.oneClickText || 'COMPRAR AHORA'}';
                addToCartBtn.click();
            }
        };

        container.appendChild(buyBtn);
        addToCartBtn.parentNode.insertBefore(container, addToCartBtn.nextSibling);
    }

    // --- THANK YOU PAGE LOGIC ---
    let tyInitialized = false;
    let retryCount = 0;

    function initThankYouPage() {
        const path = window.location.pathname;
        if (!path.includes('/success')) {
            tyInitialized = false;
            return;
        }

        if (tyInitialized) return;

        const pathParts = path.split('/');
        const successIdx = pathParts.indexOf('success');
        const orderId = pathParts[successIdx + 1];

        if (!orderId) {
            if (retryCount < 10) {
                retryCount++;
                console.log(\`[ZeroCart] ⏳ Waiting for Order ID in URL... (Attempt \${retryCount})\`);
                setTimeout(initThankYouPage, 1000);
            }
            return;
        }

        tyInitialized = true;
        console.log('[ZeroCart] 🎯 Success page reached. Fetching links for Order:', orderId);

        const backendUrl = '${hostUrl}';
        const storeId = '${storeId}';

        fetch(backendUrl + '/api/order/details?order_id=' + orderId + '&store_id=' + storeId)
            .then(res => res.json())
            .then(data => {
                if (data.products && data.products.length > 0) {
                    renderDownloadCard(data);
                } else {
                    console.log('[ZeroCart] ℹ️ No digital products found for this order.');
                }
            })
            .catch(err => {
                console.error('[ZeroCart] ❌ Error fetching links:', err);
                tyInitialized = false; // Allow retry on error
            });
    }

    function renderDownloadCard(data) {
        if (!document.getElementById('zerocart-thanks-styles')) {
            const style = document.createElement('style');
            style.id = 'zerocart-thanks-styles';
            style.innerHTML = \`
                #zerocart-thank-you {
                    background: #ffffff;
                    border: 2px solid #e1e9ff;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 20px auto;
                    max-width: 800px;
                    width: 95%;
                    box-shadow: 0 10px 25px rgba(0, 82, 255, 0.1);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    text-align: center;
                    position: relative;
                    z-index: 99;
                    box-sizing: border-box;
                    animation: zerocart-fade-in 0.5s ease-out;
                }
                @keyframes zerocart-fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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
                    border: 1px solid #edf2ff;
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
                    transition: all 0.2s;
                }
                .zerocart-item-btn:hover {
                    background: #0041cc;
                    transform: scale(1.02);
                }
            \`;
            document.head.appendChild(style);
        }

        let productsHtml = '';
        data.products.forEach(p => {
            const imgHtml = (data.config.showImage && p.image) ? \`<img src="\${p.image}" class="zerocart-item-img" />\` : '';
            productsHtml += \`
                <div class="zerocart-item-row">
                    \${imgHtml}
                    <div class="zerocart-item-info">
                        <span class="zerocart-item-name">\${p.name}</span>
                        <a href="\${p.googleDriveLink}" target="_blank" class="zerocart-item-btn">📥 DESCARGAR AHORA</a>
                    </div>
                </div>
            \`;
        });

        const htmlContent = \`
            <span class="zerocart-thanks-headline">\${data.config.headline}</span>
            <span class="zerocart-thanks-message">\${data.config.message}</span>
            <div class="zerocart-products-list">
                \${productsHtml}
            </div>
        \`;

        function inject() {
            if (document.getElementById('zerocart-thank-you')) return;
            
            const card = document.createElement('div');
            card.id = 'zerocart-thank-you';
            card.innerHTML = htmlContent;

            const target = document.querySelector('.checkout-container') || 
                           document.querySelector('.checkout__container') || 
                           document.querySelector('main') || 
                           document.body;
                           
            if (target) {
                target.prepend(card);
            }
        }

        inject();
        setInterval(inject, 1500); // Guard against SPA re-renders
    }

    // --- BOOTSTRAP ---
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log('[ZeroCart] 🔄 Navigation detected. Checking for Success page...');
            initThankYouPage();
        }
    }, 1000);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
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
