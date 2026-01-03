import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { AiModule } from '../ai/ai.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [AiModule, OrdersModule],
    providers: [WhatsappService],
    controllers: [WhatsappController],
    exports: [WhatsappService],
})
export class WhatsappModule { }
