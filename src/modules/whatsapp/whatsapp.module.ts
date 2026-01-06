import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { AiModule } from '../ai/ai.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { forwardRef } from '@nestjs/common';

@Module({
    imports: [forwardRef(() => AiModule), OrdersModule, UsersModule],
    providers: [WhatsappService],
    controllers: [WhatsappController],
    exports: [WhatsappService],
})
export class WhatsappModule { }
