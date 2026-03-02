import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { TiendanubeService } from '../services/tiendanube.service.js';

// Extender el tipo de Request para añadir la tienda y el servicio
declare global {
    namespace Express {
        interface Request {
            storeId?: string;
            tnService?: TiendanubeService;
        }
    }
}

export const authStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // En un entorno real, esto vendría de un JWT o validación HMAC de Tiendanube
        // Por ahora lo tomamos de un header para facilitar las pruebas
        const storeIdFromHeader = req.headers['x-store-id'] as string;
        const storeId = storeIdFromHeader || process.env.TEST_STORE_ID;

        if (!storeId) {
            return res.status(401).json({ error: 'No se identificó la tienda (Store ID faltante)' });
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        // Si no existe la tienda y es la de prueba, intentamos usar los del .env
        if (!store && storeId === process.env.TEST_STORE_ID) {
            req.storeId = storeId;
            req.tnService = new TiendanubeService(storeId, process.env.TEST_ACCESS_TOKEN || '');
            return next();
        }

        if (!store) {
            return res.status(404).json({ error: 'Tienda no registrada en Zerocart' });
        }

        req.storeId = store.id;
        req.tnService = new TiendanubeService(store.id, store.accessToken);

        next();
    } catch (error: any) {
        console.error('Error en middleware de autenticación:', error.message);
        res.status(500).json({ error: 'Error interno de autenticación' });
    }
};
