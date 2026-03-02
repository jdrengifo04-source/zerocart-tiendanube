import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const TIENDANUBE_API_URL = 'https://api.tiendanube.com/v1';

export class TiendanubeService {
    private accessToken: string;
    private storeId: string;
    private userAgent: string;

    constructor(storeId: string, accessToken: string) {
        this.storeId = storeId;
        this.accessToken = accessToken;
        this.userAgent = `ZeroCart (jdrengifo04@gmail.com)`;
    }

    private getHeaders() {
        return {
            'Authentication': `bearer ${this.accessToken}`,
            'User-Agent': this.userAgent,
            'Content-Type': 'application/json'
        };
    }

    async getProducts() {
        const response = await axios.get(`${TIENDANUBE_API_URL}/${this.storeId}/products`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async registerScript(src: string) {
        const response = await axios.post(`${TIENDANUBE_API_URL}/${this.storeId}/scripts`,
            {
                src,
                where: 'store',
                event: 'onload'
            },
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async createCharge(description: string, amount: number, currency: string) {
        const response = await axios.post(`${TIENDANUBE_API_URL}/${this.storeId}/charges`,
            {
                description,
                amount_value: amount,
                amount_currency: currency
            },
            { headers: this.getHeaders() }
        );
        return response.data;
    }
}
