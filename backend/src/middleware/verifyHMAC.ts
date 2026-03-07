import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to verify the HMAC signature from Tiendanube webhooks.
 * Mandatory for production apps.
 */
export const verifyTiendanubeHMAC = (req: Request, res: Response, next: NextFunction) => {
    const hmacHeader = req.headers['x-linkedstore-hmac-sha256'] as string;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!clientSecret) {
        console.error('❌ HMAC Verification Error: CLIENT_SECRET is not defined in .env');
        // In dev mode, we might want to skip this if not defined, but in prod it's fatal.
        return next();
    }

    if (!hmacHeader) {
        console.warn('⚠️ HMAC Header missing from request');
        return res.status(401).json({ error: 'HMAC Header missing' });
    }

    // Tiendanube sends the full body for HMAC calculation.
    // Express with express.json() might have already parsed it.
    // We need the raw body if possible, or stringify the body.
    const bodyString = JSON.stringify(req.body);
    const calculatedHmac = crypto
        .createHmac('sha256', clientSecret)
        .update(bodyString)
        .digest('hex');

    if (calculatedHmac !== hmacHeader) {
        console.error('❌ HMAC Verification Failed!');
        console.error('Calculated:', calculatedHmac);
        console.error('Received:', hmacHeader);
        return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    console.log('✅ HMAC Verified successfully');
    next();
};
