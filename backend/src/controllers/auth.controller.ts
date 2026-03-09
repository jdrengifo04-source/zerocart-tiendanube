import { Request, Response } from 'express';
import { TiendanubeService } from '../services/tiendanube.service.js';
import prisma from '../lib/prisma.js';

export const handleTiendanubeCallback = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'Código de autorización faltante' });
        }

        const data = await TiendanubeService.getAccessToken(code as string);

        // Guardar o actualizar la tienda en nuestra base de datos
        const store = await prisma.store.upsert({
            where: { id: data.user_id.toString() },
            update: {
                accessToken: data.access_token,
            },
            create: {
                id: data.user_id.toString(),
                accessToken: data.access_token,
                thankYouHeadline: "¡Tu compra ha sido aprobada!",
                thankYouMessage: "Gracias por tu compra. Aquí tienes tu enlace de descarga.",
                thankYouShowImage: true
            }
        });

        console.log(`✅ Tienda configurada con éxito: ${store.id}`);

        // Redirigir al frontend con el store_id
        // En una app real, aquí se emitiría un JWT o se manejaría la sesión
        res.redirect(`https://zerocart.jrengifo.com?store_id=${store.id}`);

    } catch (error: any) {
        console.error('❌ Error en el handshake de Tiendanube:', error.response?.data || error.message);
        res.status(500).send('Error durante la instalación de la aplicación');
    }
};
