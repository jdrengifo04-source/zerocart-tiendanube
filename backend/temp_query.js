import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  try {
    const s = await prisma.store.findUnique({where: {id: '7410689'}});
    console.log("STORE DB ENTRY FOR 7410689:");
    console.log(JSON.stringify(s, null, 2));

    const products = await prisma.product.findMany({where: {storeId: '7410689'}});
    console.log(`FOUND ${products.length} PRODUCTS FOR STORE 7410689`);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
