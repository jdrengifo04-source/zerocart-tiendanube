import prisma from './src/lib/prisma.js';

async function checkStore() {
    const storeId = '7410689';
    console.log('Checking store:', storeId);
    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { products: true }
        });
        console.log("DB RESULT FOR STORE:", JSON.stringify(store, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkStore();
