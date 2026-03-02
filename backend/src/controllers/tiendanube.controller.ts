import { Request, Response } from 'express';
import { TiendanubeService } from '../services/tiendanube.service.js';
import prisma from '../lib/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';

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
            return {
                ...p,
                name: p.name.es || Object.values(p.name)[0], // Normalizar el nombre aquí también por si acaso
                googleDriveLink: dbProduct?.googleDriveLink || ''
            };
        });

        res.json(productsWithLinks);
    } catch (error: any) {
        console.error('Error obteniendo productos:', error.response?.data || error.message);
        res.status(500).json({ error: 'No se pudieron obtener los productos' });
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
        const tnService = req.tnService!;
        // URL base para el script inyectable (zerocart.jrengifo.com/public/scripts/buy-now.js)
        const scriptUrl = `https://zerocart.jrengifo.com/public/scripts/buy-now.js`;
        const result = await tnService.registerScript(scriptUrl);
        res.json({ message: 'Script de "Comprar Ahora" registrado con éxito', result });
    } catch (error: any) {
        console.error('Error registrando script:', error.response?.data || error.message);
        res.status(500).json({ error: 'Fallo al registrar el script en la tienda' });
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

            const description = `Zerocart Fee - Pedido #${orderData.id}`;
            const amount = 0.15;
            const currency = orderData.main_currency || 'USD';

            console.log(`💸 Intentando cobrar ${amount} ${currency} por comisión de Zerocart...`);
            const chargeResult = await tnService.createCharge(description, amount, currency);

            console.log('✅ Cobro registrado en Tiendanube:', chargeResult.id);
            res.json({ message: 'Cobro realizado', charge_id: chargeResult.id });
        } else {
            res.status(200).json({ message: 'Ignorado (no pago o store_id faltante)' });
        }
    } catch (error: any) {
        console.error('❌ Error facturación:', error.response?.data || error.message);
        res.status(200).json({ error: 'Fallo al procesar cobro' });
    }
};


