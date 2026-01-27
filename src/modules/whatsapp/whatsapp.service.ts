import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { WhatsAppConfig } from './schemas/whatsapp-config.schema';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor() { }

    async sendTextMessage(to: string, text: string, config: WhatsAppConfig) {
        const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

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
                        Authorization: `Bearer ${config.accessToken}`,
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

    async sendImageMessage(to: string, imageUrl: string, config: WhatsAppConfig, caption?: string) {
        const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

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
                        Authorization: `Bearer ${config.accessToken}`,
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
