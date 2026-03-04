import nodemailer from 'nodemailer';

export interface ProductDeliveryInfo {
    name: string;
    image: string | null;
    googleDriveLink: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configuramos el transporter usando Nodemailer. 
        // Para producci\u00f3n, se recomienda usar un servicio como Resend, Sendgrid, o SMTP propio (Gmail, Zoho)
        // Por ahora, leemos de las variables de entorno o usamos una cuenta Ethereal para prubeas locales si no hay variables.
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Inicializa una cuenta de prubea (Ethereal) si no se configuraron credenciales SMTP.
     */
    async initTestAccountIfNeeded() {
        if (!process.env.SMTP_USER) {
            console.log("No se encontraron credenciales SMTP. Generando cuenta de prueba Ethereal...");
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log(`\u2709\ufe0f Cuenta de prueba SMTP creada: ${testAccount.user}`);
        }
    }

    async sendDigitalDeliveryEmail(
        toEmail: string,
        customerName: string,
        headline: string,
        message: string,
        products: ProductDeliveryInfo[]
    ) {
        if (!this.transporter) {
            console.error("Transporter no inicializado.");
            return;
        }

        const productHtml = products.map(product => `
            <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center;">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width: 200px; border-radius: 8px; margin-bottom: 10px;" />` : ''}
                <h3 style="margin-top: 0;">${product.name}</h3>
                <a href="${product.googleDriveLink}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Descargar Ahora
                </a>
            </div>
        `).join('');

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="text-align: center; color: #000;">${headline || '\u00a1Gracias por tu compra!'}</h1>
                <p style="text-align: center; font-size: 16px;">
                    Hola ${customerName},<br/>
                    ${message || 'Aqu\u00ed est\u00e1n los enlaces para descargar tus productos digitales.'}
                </p>
                <br/>
                ${productHtml}
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
                <p style="text-align: center; color: #888; font-size: 12px;">
                    Este es un correo autom\u00e1tico enviado desde tu tienda impulsada por ZeroCart.
                </p>
            </div>
        `;

        try {
            const info = await this.transporter.sendMail({
                from: '"Tu Tienda" <noreply@tutienda.com>', // En producci\u00f3n debe ser el correo de la tienda
                to: toEmail,
                subject: headline || '\u00a1Tus productos digitales est\u00e1n listos!',
                html: htmlContent,
            });

            console.log(`\u2705 Correo enviado con \u00e9xito a ${toEmail}. MessageId: ${info.messageId}`);

            // Si usamos Ethereal, podemos ver el correo en una URL p\u00fablica generada por ellos:
            if (info.messageId && !process.env.SMTP_USER) {
                console.log(`\ud83d\udc40 Vista previa del correo disponible en: ${nodemailer.getTestMessageUrl(info)}`);
            }

            return info;
        } catch (error) {
            console.error('\u274c Error enviando el correo de entrega digital:', error);
            throw error;
        }
    }
}
