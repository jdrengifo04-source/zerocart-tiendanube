(function () {
    console.log('🚀 Zerocart: Botón "Comprar Ahora" activado.');

    // Configuración de selectores comunes en temas de Tiendanube
    const ADD_TO_CART_SELECTORS = [
        '.js-addtocart',
        '.js-addtocart-button',
        '.btn-add-to-cart',
        'input[name="add_to_cart"]',
        'button[type="submit"].js-add-to-cart-button'
    ];

    function initBuyNow() {
        let addToCartBtn = null;

        // Buscar el botón original
        for (const selector of ADD_TO_CART_SELECTORS) {
            const btn = document.querySelector(selector);
            if (btn) {
                addToCartBtn = btn;
                break;
            }
        }

        if (!addToCartBtn) {
            console.log('⚠️ Zerocart: No se encontró el botón de compra en esta página.');
            return;
        }

        // Ocultar el botón original (o lo clonamos y reemplazamos)
        addToCartBtn.style.display = 'none';

        // Crear nuestro botón "Comprar Ahora" Premium
        const buyNowBtn = document.createElement('button');
        buyNowBtn.innerHTML = '⚡ Comprar Ahora';
        buyNowBtn.type = 'button';

        // Aplicar estilos premium directamente (o usar clases si el tema tiene algunas buenas)
        Object.assign(buyNowBtn.style, {
            backgroundColor: '#00bfa5', // El color que elegimos
            color: 'white',
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            marginTop: '10px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 191, 165, 0.3)',
            textTransform: 'uppercase'
        });

        buyNowBtn.onmouseover = () => {
            buyNowBtn.style.backgroundColor = '#00a38d';
            buyNowBtn.style.transform = 'translateY(-2px)';
        };

        buyNowBtn.onmouseout = () => {
            buyNowBtn.style.backgroundColor = '#00bfa5';
            buyNowBtn.style.transform = 'translateY(0)';
        };

        // Insertar nuestro botón al lado del original
        addToCartBtn.parentNode.insertBefore(buyNowBtn, addToCartBtn.nextSibling);

        // Lógica de click
        buyNowBtn.onclick = async function (e) {
            e.preventDefault();
            buyNowBtn.innerHTML = 'Procesando...';
            buyNowBtn.disabled = true;

            // Obtener el variant_id del formulario original si es posible
            const form = addToCartBtn.closest('form');
            const variantInput = form ? form.querySelector('input[name="variant_id"]') : null;
            const variantId = variantInput ? variantInput.value : null;

            if (!variantId) {
                console.error('❌ Zerocart: No se pudo identificar el Variant ID.');
                alert('Lo sentimos, no pudimos procesar la compra instantánea. Intenta con el botón normal.');
                addToCartBtn.style.display = 'block';
                buyNowBtn.remove();
                return;
            }

            try {
                // 1. Agregar al carrito vía AJAX
                console.log('🛒 Zerocart: Agregando producto ' + variantId + ' al carrito...');

                const response = await fetch('/cart/add/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new URLSearchParams({
                        'variant_id': variantId,
                        'quantity': 1
                    })
                });

                if (response.ok) {
                    console.log('✅ Zerocart: Producto agregado. Saltando al Checkout.');
                    // 2. Redirigir directamente al checkout
                    window.location.href = '/checkout';
                } else {
                    throw new Error('Fallo en la API de Tiendanube');
                }
            } catch (error) {
                console.error('❌ Zerocart Error:', error);
                window.location.href = '/checkout'; // Intentamos redirigir de todos modos por si ya se agregó
            }
        };
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBuyNow);
    } else {
        initBuyNow();
    }
})();
