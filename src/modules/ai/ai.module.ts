import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [ConfigModule, ProductsModule, OrdersModule],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
