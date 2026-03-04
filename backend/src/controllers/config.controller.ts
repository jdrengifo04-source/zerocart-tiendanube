import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/store/config
export const getStoreConfig = async (req: Request, res: Response) => {
    try {
        // Obtenemos el storeId desde el token (authStore middleware)
        const storeId = (req as any).storeId;

        if (!storeId) {
            return res.status(401).json({ error: 'No autorizado' });
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
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }

        res.json(store);
    } catch (error) {
        console.error('Error al obtener la configuración de la tienda:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// PATCH /api/store/config
export const updateStoreConfig = async (req: Request, res: Response) => {
    try {
        const storeId = (req as any).storeId;

        if (!storeId) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const {
            oneClickEnabled,
            oneClickText,
            oneClickBgColor,
            oneClickTextColor,
            oneClickSize,
            thankYouHeadline,
            thankYouMessage,
            thankYouShowImage
        } = req.body;

        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: {
                oneClickEnabled,
                oneClickText,
                oneClickBgColor,
                oneClickTextColor,
                oneClickSize,
                thankYouHeadline,
                thankYouMessage,
                thankYouShowImage
            },
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

        res.json({ message: 'Configuración actualizada correctamente', config: updatedStore });
    } catch (error) {
        console.error('Error al actualizar la configuración de la tienda:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
