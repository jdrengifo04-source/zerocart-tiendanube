import { Request, Response } from 'express';
import { TiendanubeService } from '../services/tiendanube.service.ts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const STORE_ID = process.env.TEST_STORE_ID || '';
const ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN || '';

const tnService = new TiendanubeService(STORE_ID, ACCESS_TOKEN);

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await tnService.getProducts();
        res.json(products);
    } catch (error: any) {
        console.error('Error obteniendo productos:', error.response?.data || error.message);
        res.status(500).json({ error: 'No se pudieron obtener los productos de Tiendanube' });
    }
};

export const registerBuyNowScript = async (req: Request, res: Response) => {
    try {
        const scriptUrl = 'https://raw.githubusercontent.com/usuario/repo/main/scripts/buy-now.js';
        const result = await tnService.registerScript(scriptUrl);
        res.json({ message: 'Script de "Comprar Ahora" registrado con éxito', result });
    } catch (error: any) {
        console.error('Error registrando script:', error.response?.data || error.message);
        res.status(500).json({ error: 'Fallo al registrar el script en la tienda' });
    }
};
