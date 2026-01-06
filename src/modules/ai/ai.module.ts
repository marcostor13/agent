import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { forwardRef } from '@nestjs/common';

@Module({
    imports: [ConfigModule, ProductsModule, OrdersModule, forwardRef(() => WhatsappModule)],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
