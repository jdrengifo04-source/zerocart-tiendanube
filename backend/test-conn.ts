import 'dotenv/config';
import { TiendanubeService } from './src/services/tiendanube.service.js';

async function testConnection() {
    const storeId = process.env.TEST_STORE_ID || '';
    const accessToken = process.env.TEST_ACCESS_TOKEN || '';

    console.log(`Testing connection for Store: ${storeId}`);
    console.log(`Access Token: ${accessToken.substring(0, 5)}...`);

    const tnService = new TiendanubeService(storeId, accessToken);

    try {
        const products = await tnService.getProducts();
        console.log(`Success! Found ${products.length} products.`);
        if (products.length > 0) {
            console.log('Sample product:', products[0].name.es || products[0].name);
        }
    } catch (error: any) {
        console.error('Connection failed!');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Message:', error.message);
    }
}

testConnection();
