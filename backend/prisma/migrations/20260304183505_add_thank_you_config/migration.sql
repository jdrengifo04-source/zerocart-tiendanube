-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "oneClickBgColor" TEXT NOT NULL DEFAULT '#0052FF',
ADD COLUMN     "oneClickEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oneClickSize" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "oneClickText" TEXT NOT NULL DEFAULT 'Comprar Ahora',
ADD COLUMN     "oneClickTextColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "thankYouHeadline" TEXT NOT NULL DEFAULT '¡Tu compra ha sido aprobada!',
ADD COLUMN     "thankYouMessage" TEXT NOT NULL DEFAULT 'Gracias por tu compra. Aquí tienes tu enlace de descarga.',
ADD COLUMN     "thankYouShowImage" BOOLEAN NOT NULL DEFAULT true;
