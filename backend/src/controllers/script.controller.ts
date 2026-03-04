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
        '.js-addtocart-button',
        '.btn-add-to-cart',
        'input[name="add_to_cart"]',
        'button[type="submit"].js-add-to-cart-button'
    ];

    function initBuyNow() {
        let addToCartBtn = null;
        for (const selector of ADD_TO_CART_SELECTORS) {
            const btn = document.querySelector(selector);
            if (btn) {
                addToCartBtn = btn;
                break;
            }
        }

        if (!addToCartBtn) {
            console.log('⚠️ Zerocart: No se encontró el botón de compra.');
            return;
        }

        addToCartBtn.style.display = 'none';

        const buyNowBtn = document.createElement('button');
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

            const form = addToCartBtn.closest('form');
            const variantInput = form ? form.querySelector('input[name="variant_id"]') : null;
            const variantId = variantInput ? (variantInput as HTMLInputElement).value : null;

            if (!variantId) {
                console.error('❌ Zerocart: No se pudo identificar el Variant ID.');
                alert('Lo sentimos, intenta con el botón normal.');
                addToCartBtn.style.display = 'block';
                buyNowBtn.remove();
                return;
            }

            try {
                const response = await fetch('/cart/add/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new URLSearchParams({
                        'variant_id': variantId,
                        'quantity': '1'
                    })
                });

                if (response.ok) {
                    window.location.href = '/checkout';
                } else {
                    throw new Error('Fallo en la API de Tiendanube');
                }
            } catch (error) {
                window.location.href = '/checkout';
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
