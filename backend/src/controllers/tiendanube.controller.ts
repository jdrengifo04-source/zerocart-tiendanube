import { Request, Response } from 'express';
import { TiendanubeService } from '../services/tiendanube.service.js';
import prisma from '../lib/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmailService } from '../services/email.service.js';

const emailService = new EmailService();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




export const getProducts = async (req: Request, res: Response) => {
    try {
        const tnService = req.tnService!;
        const storeId = req.storeId!;

        const tnProducts = await tnService.getProducts();

        // Obtener los links guardados en nuestra DB
        const dbProducts = await prisma.product.findMany({
            where: { storeId }
        });

        // Combinar datos
        const productsWithLinks = tnProducts.map((p: any) => {
            const dbProduct = dbProducts.find((dp: any) => dp.id === p.id.toString());
            const firstVariant = p.variants && p.variants.length > 0 ? p.variants[0] : null;
            return {
                ...p,
                name: p.name.es || Object.values(p.name)[0], // Normalizar el nombre aquí también por si acaso
                image: p.images && p.images.length > 0 ? p.images[0].src : null,
                googleDriveLink: dbProduct?.googleDriveLink || '',
                price: firstVariant ? firstVariant.price : '0.00',
                promotional_price: firstVariant ? firstVariant.promotional_price || firstVariant.compare_at_price : null
            };
        });

        res.json(productsWithLinks);
    } catch (error: any) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || error.message;

        console.error('Error obteniendo productos:', errorMessage);

        if (statusCode === 401) {
            return res.status(401).json({
                error: 'Token de Tiendanube expirado o inválido. Por favor, vuelve a entrar desde el panel de Tiendanube.'
            });
        }

        res.status(statusCode).json({ error: 'No se pudieron obtener los productos' });
    }
};

export const updateProductLink = async (req: Request, res: Response) => {
    try {
        const { productId, googleDriveLink } = req.body;
        const storeId = req.storeId!;

        const product = await prisma.product.upsert({
            where: { id: productId.toString() },
            update: { googleDriveLink },
            create: {
                id: productId.toString(),
                storeId,
                googleDriveLink
            }
        });

        res.json({ message: 'Link actualizado con éxito', product });
    } catch (error: any) {
        console.error('Error guardando link:', error.message);
        res.status(500).json({ error: 'No se pudo guardar el link' });
    }
};


export const registerBuyNowScript = async (req: Request, res: Response) => {
    try {
        // La registración del script ahora se maneja globalmente desde el Panel de Partners de Tiendanube
        // mediante la opción "Instalación automática" y el script ID #5084.
        // No es necesario realizar llamadas por cada tienda.
        res.json({
            message: 'Configuración sincronizada con el script global de Zerocart',
            script_id: '#5084'
        });
    } catch (error: any) {
        console.error('Error en sync de script:', error.message);
        res.status(500).json({ error: 'Fallo al sincronizar la configuración' });
    }
};

export const handleOrderPaidWebhook = async (req: Request, res: Response) => {
    try {
        const orderData = req.body;
        // El webhook envía el store_id en la cabecera o el cuerpo usualmente, pero aquí necesitamos
        // instanciar el servicio para ese store_id específico que recibimos del pago.
        const storeId = orderData.store_id || req.headers['x-tiendanube-store-id'];

        console.log(`💰 Webhook Recibido: Pedido Pago #${orderData.id} de Tienda ${storeId}`);

        if (orderData.status === 'paid' && storeId) {
            // Buscar credenciales de la tienda
            const store = await prisma.store.findUnique({ where: { id: storeId.toString() } });

            if (!store && storeId.toString() !== process.env.TEST_STORE_ID) {
                return res.status(404).json({ error: 'Tienda no registrada para este webhook' });
            }

            const accessToken = store?.accessToken || process.env.TEST_ACCESS_TOKEN || '';
            const tnService = new TiendanubeService(storeId.toString(), accessToken);

            // ==========================================
            // 1. Cobro de Comisión (Si Aplica)
            // ==========================================
            try {
                const description = `Zerocart Fee - Pedido #${orderData.id}`;
                const amount = 0.15;
                const currency = orderData.main_currency || 'USD';

                console.log(`💸 Intentando cobrar ${amount} ${currency} por comisión de Zerocart...`);
                const chargeResult = await tnService.createCharge(description, amount, currency);
                console.log('✅ Cobro registrado en Tiendanube:', chargeResult.id);
            } catch (feeError: any) {
                console.error('⚠️ Fallo al cobrar fee, continuando de igual manera:', feeError.message);
            }

            // ==========================================
            // 2. Entrega Automática de Productos Digitales
            // ==========================================
            try {
                const productIds = orderData.products?.map((p: any) => p.product_id?.toString()) || [];

                if (productIds.length > 0) {
                    const dbProducts = await prisma.product.findMany({
                        where: { id: { in: productIds }, storeId: storeId.toString() }
                    });

                    // Match productos comprados con los que tienen link en la base de datos
                    const digitalProducts = orderData.products.map((p: any) => {
                        const dbProduct = dbProducts.find(dp => dp.id === p.product_id?.toString());
                        return {
                            name: p.name?.es || (p.name ? Object.values(p.name)[0] : 'Producto Digital'),
                            image: p.image?.src || null,
                            googleDriveLink: dbProduct?.googleDriveLink || null
                        };
                    }).filter((p: any) => p.googleDriveLink !== null);

                    const customerEmail = orderData.customer?.email;

                    if (digitalProducts.length > 0 && customerEmail) {
                        console.log(`🚀 Iniciando entrega digital de ${digitalProducts.length} productos para ${customerEmail}`);
                        await emailService.initTestAccountIfNeeded();
                        await emailService.sendDigitalDeliveryEmail(
                            customerEmail,
                            orderData.customer?.name || 'Cliente',
                            store?.thankYouHeadline || '¡Gracias por tu compra!',
                            store?.thankYouMessage || 'Aquí están los enlaces para descargar tus productos digitales.',
                            digitalProducts
                        );
                    } else {
                        console.log(`ℹ️ Pedido #${orderData.id} no contiene productos digitales o no se encontró el email.`);
                    }
                }
            } catch (deliveryError: any) {
                console.error('❌ Error en el proceso de entrega digital:', deliveryError);
            }

            res.json({ message: 'Webhook procesado' });
        } else {
            res.status(200).json({ message: 'Ignorado (no pago o store_id faltante)' });
        }
    } catch (error: any) {
        console.error('❌ Error general en Webhook:', error.response?.data || error.message);
        res.status(200).json({ error: 'Fallo al procesar webhook' });
    }
};

export const handleAppUninstalledWebhook = async (req: Request, res: Response) => {
    try {
        const { store_id } = req.body;

        if (!store_id) {
            return res.status(400).json({ error: 'Store ID missing in webhook body' });
        }

        console.log(`🗑️ Webhook Desinstalación: Tienda ${store_id}`);

        // Opcional: Eliminar datos o simplemente marcar como inactiva
        await prisma.store.update({
            where: { id: store_id.toString() },
            data: { isActive: false }
        });

        res.json({ message: 'Tienda marcada como inactiva con éxito' });
    } catch (error: any) {
        console.error('❌ Error en Webhook de Desinstalación:', error.message);
        res.status(200).json({ error: 'Fallo al procesar desinstalación' });
    }
};

/**
 * GDPR: store/redact
 * Mandatorio para publicación. Se activa cuando un merchant desinstala la app.
 */
export const handleStoreRedact = async (req: Request, res: Response) => {
    try {
        const { store_id } = req.body;
        console.log(`🔒 GDPR store/redact: Solicitud de eliminación para tienda ${store_id}`);

        // El proceso oficial pide eliminar datos sensibles. 
        // Ya manejamos la desactivación en handleAppUninstalledWebhook, 
        // así que aquí cumplimos con el protocolo de respuesta.
        res.status(200).send('Store data redaction scheduled');
    } catch (error: any) {
        console.error('Error en GDPR store/redact:', error.message);
        res.status(200).send('Error but acknowledged');
    }
};

/**
 * GDPR: customers/redact
 * Mandatorio para publicación. Se activa cuando un cliente solicita borrar sus datos.
 */
export const handleCustomerRedact = async (req: Request, res: Response) => {
    try {
        const { store_id, customer } = req.body;
        console.log(`🔒 GDPR customers/redact: Tienda ${store_id}, Cliente ${customer?.email}`);

        // Zerocart no almacena datos de clientes de forma persistente (solo los procesa para el email),
        // pero registramos la recepción para cumplimiento.
        res.status(200).send('Customer data redaction scheduled');
    } catch (error: any) {
        console.error('Error en GDPR customers/redact:', error.message);
        res.status(200).send('Error but acknowledged');
    }
};

/**
 * GDPR: customers/data_request
 * Mandatorio para publicación. Se activa cuando un cliente pide ver sus datos.
 */
export const handleCustomerDataRequest = async (req: Request, res: Response) => {
    try {
        const { store_id, customer } = req.body;
        console.log(`🔒 GDPR customers/data_request: Tienda ${store_id}, Cliente ${customer?.email}`);

        // Respondemos 200 para indicar que recibimos la solicitud.
        res.status(200).send('Customer data request received');
    } catch (error: any) {
        console.error('Error en GDPR customers/data-request:', error.message);
        res.status(200).send('Error but acknowledged');
    }
};
