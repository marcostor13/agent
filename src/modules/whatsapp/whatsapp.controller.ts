import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppWebhookDTO } from './dto/whatsapp-webhook.dto';
import { AiService } from '../ai/ai.service';
import { OrdersService } from '../orders/orders.service';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

@Controller('whatsapp')
export class WhatsappController {
    private readonly logger = new Logger(WhatsappController.name);

    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly configService: ConfigService,
        private readonly aiService: AiService,
        private readonly ordersService: OrdersService,
    ) { }

    @Get('webhook')
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');

        if (mode === 'subscribe' && token === verifyToken) {
            this.logger.log('Webhook verified successfully');
            return challenge;
        }

        this.logger.warn('Webhook verification failed');
        return 'Verification failed';
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() body: WhatsAppWebhookDTO) {
        this.logger.debug('Received WhatsApp webhook:', JSON.stringify(body, null, 2));

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message && message.type === 'text' && message.text) {
            const from = message.from; // phoneNumber
            const text = message.text.body;
            const contactName = value.contacts?.[0]?.profile?.name || 'Usuario';

            this.logger.log(`Message from ${contactName} (${from}): ${text}`);

            try {
                // Load history from MongoDB
                const rawHistory = await this.ordersService.getChatHistory(from);
                const history = rawHistory.map(m =>
                    m.type === 'human' ? new HumanMessage(m.content) : new AIMessage(m.content)
                );

                const aiResponse = await this.aiService.processMessage(`${text} (Usuario: ${from})`, history);

                // Save history back to MongoDB
                await this.ordersService.saveChatHistory(from, 'human', text);
                await this.ordersService.saveChatHistory(from, 'ai', aiResponse);

                await this.whatsappService.sendTextMessage(from, aiResponse);
            } catch (error) {
                this.logger.error(`Failed to handle message from ${from}: ${error.message}`);
            }
        }

        return { status: 'ok' };
    }
}
