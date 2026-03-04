import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const storeId = "7317678";
        console.log(`Checking store: ${storeId}`);
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });
        console.log('Store found:', JSON.stringify(store, null, 2));

        const productsCount = await prisma.product.count({
            where: { storeId }
        });
        console.log(`Products in DB for this store: ${productsCount}`);

    } catch (error) {
        console.error('Error diagnostic script:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
