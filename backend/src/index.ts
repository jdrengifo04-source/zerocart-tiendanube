import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getProducts, registerBuyNowScript, handleOrderPaidWebhook, updateProductLink } from './controllers/tiendanube.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// En Docker, el puerto debe venir de la variable de entorno o usar 3001
const PORT = Number(process.env.PORT) || 3001;

// Log de depuración para ver si las variables cargaron (solo en logs de servidor)
console.log('--- Configuración de Inicio ---');
console.log('Puerto:', PORT);
console.log('¿DB URL presente?:', process.env.DATABASE_URL ? 'SÍ' : 'NO (ERROR)');
console.log('-------------------------------');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 1. SERVIR SCRIPTS INYECTABLES
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
const clientDistPath = path.join(__dirname, '../client-dist');

if (fs.existsSync(clientDistPath)) {
    console.log('Modo Producción: Sirviendo frontend desde client-dist');
    app.use(express.static(clientDistPath));

    // Catch-all para SPA (seguro para Express 4 y 5)
    app.use((req: Request, res: Response) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(clientDistPath, 'index.html'));
        } else {
            res.status(404).json({ error: 'Endpoint de API no encontrado' });
        }
    });
}

// IMPORTANTE: En Docker/EasyPanel DEBE ser '0.0.0.0'
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zerocart Backend escuchando en modo global en puerto ${PORT}`);
});
