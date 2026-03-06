import prisma from './src/lib/prisma.js';

async function checkProducts() {
    const storeId = '7317678';
    console.log('Checking products for store:', storeId);
    try {
        const products = await prisma.product.findMany({
            where: { storeId }
        });
        console.log('Found products:', products.length);
        products.forEach(p => {
            console.log(`- ID: ${p.id}, Name: ${p.name}, Drive: ${p.googleDriveLink}`);
        });
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkProducts();
