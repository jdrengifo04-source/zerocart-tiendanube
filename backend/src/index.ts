import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProducts, registerBuyNowScript } from './controllers/tiendanube.controller.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas de prueba
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'Zerocart Backend is running', timestamp: new Date() });
});

// Rutas de Tiendanube
app.get('/api/products', getProducts);
app.post('/api/install-scripts', registerBuyNowScript);

// Webhooks
app.post('/api/webhooks/order-paid', (req: Request, res: Response) => {
    console.log('Webhook recibido:', req.body);
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Zerocart Backend escuchando en http://localhost:${PORT}`);
});
