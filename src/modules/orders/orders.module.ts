import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { ChatHistory, ChatHistorySchema } from './schemas/chat-history.schema';
import { OrdersService } from './orders.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Cart.name, schema: CartSchema },
            { name: Order.name, schema: OrderSchema },
            { name: ChatHistory.name, schema: ChatHistorySchema },
        ]),
    ],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
