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

        const buyNowBtn = document.createElement('button');
        buyNowBtn.id = 'zerocart-buy-now';
        buyNowBtn.innerHTML = '⚡ ${store.oneClickText}';
        buyNowBtn.type = 'button';

        // Ancho según configuración
        let buttonWidth = 'auto';
        if ('${store.oneClickSize}' === 'grande') {
            buttonWidth = '80%';
        } else if ('${store.oneClickSize}' === 'completo') {
            buttonWidth = '100%';
        } else {
            buttonWidth = '100%'; // Default for normal for now, usually buttons are full width on mobile
        }

        Object.assign(buyNowBtn.style, {
            backgroundColor: '${store.oneClickBgColor}',
            color: '${store.oneClickTextColor}',
            padding: '${store.oneClickSize === "normal" ? "12px 24px" : "16px 32px"}',
            fontSize: '${store.oneClickSize === "grande" || store.oneClickSize === "completo" ? "20px" : "16px"}',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: buttonWidth,
            marginTop: '10px',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase'
        });

        buyNowBtn.onmouseover = () => {
            buyNowBtn.style.opacity = '0.9';
            buyNowBtn.style.transform = 'translateY(-2px)';
        };

        buyNowBtn.onmouseout = () => {
            buyNowBtn.style.opacity = '1';
            buyNowBtn.style.transform = 'translateY(0)';
        };

        addToCartBtn.parentNode.insertBefore(buyNowBtn, addToCartBtn.nextSibling);

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBuyNow);
    } else {
        initBuyNow();
    }
})();
`;

        res.type('application/javascript').send(scriptContent);
    } catch (error) {
        console.error('Error sirviendo script dinámico:', error);
        res.status(500).send('console.error("Error interno en Zerocart API");');
    }
};
