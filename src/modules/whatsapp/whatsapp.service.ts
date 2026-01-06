import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);
    private readonly accessToken: string;
    private readonly phoneNumberId: string;
    private readonly apiVersion: string;

    constructor(private configService: ConfigService) {
        this.accessToken = this.configService.get<string>('WHATSAPP_TOKEN') || '';
        this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';
        this.apiVersion = this.configService.get<string>('WHATSAPP_API_VERSION', 'v17.0');
    }

    async sendTextMessage(to: string, text: string) {
        const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

        try {
            const response = await axios.post(
                url,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'text',
                    text: { preview_url: false, body: text },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            this.logger.error(`Error sending WhatsApp message: ${errorData ? JSON.stringify(errorData) : error.message}`);
            throw error;
        }
    }

    async sendImageMessage(to: string, imageUrl: string, caption?: string) {
        const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

        try {
            const response = await axios.post(
                url,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'image',
                    image: {
                        link: imageUrl,
                        caption: caption
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            this.logger.error(`Error sending WhatsApp image: ${errorData ? JSON.stringify(errorData) : error.message}`);
            throw error;
        }
    }

    // TODO: Implement sendTemplateMessage, etc.

}
