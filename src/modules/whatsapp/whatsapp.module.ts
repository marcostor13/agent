import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsAppConfig, WhatsAppConfigSchema } from './schemas/whatsapp-config.schema';
import { WhatsAppConfigService } from './whatsapp-config.service';
import { WhatsAppConfigController } from './whatsapp-config.controller';
import { AiModule } from '../ai/ai.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { forwardRef } from '@nestjs/common';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: WhatsAppConfig.name, schema: WhatsAppConfigSchema }]),
        forwardRef(() => AiModule),
        OrdersModule,
        UsersModule,
    ],
    providers: [WhatsappService, WhatsAppConfigService],
    controllers: [WhatsappController, WhatsAppConfigController],
    exports: [WhatsappService, WhatsAppConfigService],
})
export class WhatsappModule { }
