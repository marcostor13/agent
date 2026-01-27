import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppWebhookDTO } from './dto/whatsapp-webhook.dto';
import { AiService } from '../ai/ai.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { WhatsAppConfigService } from './whatsapp-config.service';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

@Controller('whatsapp')
export class WhatsappController {
    private readonly logger = new Logger(WhatsappController.name);

    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly aiService: AiService,
        private readonly ordersService: OrdersService,
        private readonly usersService: UsersService,
        private readonly configService: WhatsAppConfigService,
    ) { }

    @Get('webhook')
    async verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        if (mode !== 'subscribe') return 'Verification failed';

        const configs = await this.configService.findAll();
        const isValid = configs.some(c => c.verifyToken === token);

        if (isValid) {
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
        const phoneNumberId = value?.metadata?.phone_number_id;

        if (message && message.type === 'text' && message.text && phoneNumberId) {
            const from = message.from; // phoneNumber
            const text = message.text.body;
            const contactName = value.contacts?.[0]?.profile?.name || 'Usuario';

            this.logger.log(`Message to ${phoneNumberId} from ${contactName} (${from}): ${text}`);

            try {
                // Fetch WhatsApp Configuration
                const config = await this.configService.findByPhoneNumberId(phoneNumberId);

                // Check if number is authorized
                const auth = await this.usersService.getAuthorization(from);
                if (!auth) {
                    this.logger.warn(`Unauthorized message from ${from}`);
                    return { status: 'unauthorized' };
                }

                // Load history from MongoDB
                const rawHistory = await this.ordersService.getChatHistory(from, config._id.toString());
                const history = rawHistory.map(m =>
                    m.type === 'human' ? new HumanMessage(m.content) : new AIMessage(m.content)
                );

                const aiResponse = await this.aiService.processMessage(
                    `${text} (Usuario: ${from})`,
                    history,
                    config,
                );

                // Save history back to MongoDB
                await this.ordersService.saveChatHistory(from, 'human', text, config._id.toString());
                await this.ordersService.saveChatHistory(from, 'ai', aiResponse, config._id.toString());

                await this.whatsappService.sendTextMessage(from, aiResponse, config);
            } catch (error) {
                this.logger.error(`Failed to handle message from ${from}: ${error.message}`);
            }
        }

        return { status: 'ok' };
    }
}
