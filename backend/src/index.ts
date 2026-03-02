import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ¡IMPORTANTE! Cargar variables ANTES de importar controladores o servicios
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import { getProducts, registerBuyNowScript, handleOrderPaidWebhook, updateProductLink } from './controllers/tiendanube.controller.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 1. SERVIR SCRIPTS INYECTABLES (Para Tiendanube)
// Estos viven en la carpeta /public local
app.use('/public', express.static(path.join(__dirname, '../public')));

// Rutas de API
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'Zerocart Backend is running', timestamp: new Date() });
});

app.get('/api/products', getProducts);
app.put('/api/products/link', updateProductLink);
app.post('/api/install-scripts', registerBuyNowScript);
app.post('/api/webhooks/order-paid', handleOrderPaidWebhook);

// 2. SERVIR FRONTEND DE ADMINISTRACIÓN (React)
// Buscamos la carpeta client-dist que genera el Dockerfile en producción
const clientDistPath = path.join(__dirname, '../client-dist');

if (fs.existsSync(clientDistPath)) {
    console.log('Modo Producción: Sirviendo frontend desde client-dist');
    app.use(express.static(clientDistPath));

    // Cualquier ruta que no sea API, entrega el index.html de React
    app.get('*', (req: Request, res: Response) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(clientDistPath, 'index.html'));
        }
    });
}

app.listen(PORT, () => {
    console.log(`Zerocart Backend escuchando en http://localhost:${PORT}`);
});
