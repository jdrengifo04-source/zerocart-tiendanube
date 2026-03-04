import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function test() {
    try {
        const storeId = process.env.TEST_STORE_ID;
        if (!storeId) throw new Error("No TEST_STORE_ID in .env");

        let accessToken = process.env.TEST_ACCESS_TOKEN;
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (store) {
            accessToken = store.accessToken;
            console.log("Using token from database: " + accessToken.substring(0, 10) + "...");
        } else {
            console.log("Using token from .env: " + accessToken?.substring(0, 10) + "...");
        }

        const scriptUrl = `https://zerocart.jrengifo.com/api/scripts/${storeId}/buy-now.js`;
        console.log(`Registering script: ${scriptUrl}`);

        const response = await axios.post(`https://api.tiendanube.com/v1/${storeId}/scripts`,
            {
                src: scriptUrl,
                where: 'store',
                event: 'onload'
            },
            {
                headers: {
                    'Authorization': `bearer ${accessToken}`,
                    'User-Agent': 'ZeroCart (jdrengifo04@gmail.com)',
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Success:", response.data);
    } catch (e: any) {
        if (e.response) {
            console.log("API Error:", e.response.status, JSON.stringify(e.response.data, null, 2));
        } else {
            console.log("Error:", e.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

test();
