import { Request, Response } from 'express';
import { TiendanubeService } from '../services/tiendanube.service.js';
import prisma from '../lib/prisma.js';

// GET /api/order/details?cart_id=...&store_id=...
export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { cart_id, store_id } = req.query;

        console.log(`🔍 Consultando detalles del carrito #${cart_id} para tienda ${store_id}`);

        if (!cart_id || !store_id) {
            return res.status(400).json({ error: 'Cart ID and Store ID are required' });
        }

        // 1. Buscar la tienda y su token
        const store = await prisma.store.findUnique({
            where: { id: store_id.toString() }
        });

        if (!store) {
            console.error(`❌ Tienda ${store_id} no encontrada`);
            return res.status(404).json({ error: 'Store not found' });
        }

        // 2. Consultar el pedido en Tiendanube por cart_id
        const tnService = new TiendanubeService(store_id.toString(), store.accessToken);
        const ordersResponse = await tnService.getOrderByCartId(cart_id.toString());

        if (!ordersResponse || ordersResponse.length === 0) {
            console.error(`❌ Pedido asociado al carrito ${cart_id} no encontrado en Tiendanube`);
            return res.status(404).json({ error: 'Order not found for this cart' });
        }

        const order = ordersResponse[0];

        // 3. Verificar que el pedido esté pago
        // Tiendanube usa 'paid' para status y payment_status
        const isPaid = order.status === 'paid' || order.payment_status === 'paid' || order.payment_status === 'approved';

        if (!isPaid) {
            console.warn(`⚠️ Pedido #${order.id} (Cart: ${cart_id}) no está marcado como pago. Status: ${order.status}, Payment: ${order.payment_status}`);
            return res.status(403).json({
                error: 'Order is not paid yet',
                status: order.status,
                payment_status: order.payment_status
            });
        }

        // 4. Obtener los IDs de los productos comprados
        const productIds = order.products.map((p: any) => p.product_id.toString());

        // 5. Buscar los links de esos productos en nuestra DB
        const dbProducts = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                storeId: store_id.toString()
            }
        });

        // 6. Preparar la respuesta con la configuración de la tienda y los links
        const responseData = {
            config: {
                headline: store.thankYouHeadline,
                message: store.thankYouMessage,
                showImage: store.thankYouShowImage
            },
            products: order.products.map((p: any) => {
                const dbProduct = dbProducts.find(dp => dp.id === p.product_id.toString());
                return {
                    id: p.product_id,
                    name: p.name.es || Object.values(p.name)[0],
                    image: p.image?.src || null,
                    googleDriveLink: dbProduct?.googleDriveLink || null
                };
            }).filter((p: any) => p.googleDriveLink !== null) // Solo devolver los que tienen link digital
        };

        console.log(`✅ Entregando links para ${responseData.products.length} productos del pedido #${order.id}`);
        res.json(responseData);
    } catch (error: any) {
        console.error('❌ Error fetching order details:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch purchase details' });
    }
};
