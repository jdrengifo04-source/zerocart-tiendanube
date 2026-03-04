import axios from 'axios';

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

    async getOrder(orderId: string) {
        const response = await axios.get(`${TIENDANUBE_API_URL}/${this.storeId}/orders/${orderId}`, {
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

    static async getAccessToken(code: string) {
        const response = await axios.post('https://www.tiendanube.com/apps/authorize/token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code
        });
        return response.data;
    }
}
