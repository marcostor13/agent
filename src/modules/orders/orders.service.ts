import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { Order } from './schemas/order.schema';
import { ChatHistory } from './schemas/chat-history.schema';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectModel(Cart.name) private cartModel: Model<Cart>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(ChatHistory.name) private historyModel: Model<ChatHistory>,
    ) { }

    async getOrCreateCart(phoneNumber: string): Promise<Cart> {
        let cart = await this.cartModel.findOne({ phoneNumber });
        if (!cart) {
            cart = await this.cartModel.create({ phoneNumber, items: [], total: 0 });
        }
        return cart;
    }

    async addItemToCart(phoneNumber: string, item: any) {
        const cart = await this.getOrCreateCart(phoneNumber);
        cart.items.push(item);
        cart.total = cart.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        return cart.save();
    }

    async clearCart(phoneNumber: string) {
        return this.cartModel.findOneAndUpdate({ phoneNumber }, { items: [], total: 0 }, { new: true });
    }

    async createOrder(phoneNumber: string, customerData: any) {
        const cart = await this.cartModel.findOne({ phoneNumber });
        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        const order = await this.orderModel.create({
            phoneNumber,
            ...customerData,
            items: cart.items,
            total: cart.total,
            status: 'pending',
        });

        await this.clearCart(phoneNumber);
        return order;
    }

    async generatePaymentLink(orderId: string): Promise<string> {
        // Mock payment link generation
        // In a real scenario, this would call an API like Culqi or MercadoPago
        const paymentLink = `https://checkout.zimnolperu.pe/pay/${orderId}`;
        await this.orderModel.findByIdAndUpdate(orderId, { paymentLink });
        return paymentLink;
    }

    async getCartSummary(phoneNumber: string): Promise<string> {
        const cart = await this.cartModel.findOne({ phoneNumber });
        if (!cart || cart.items.length === 0) return 'Tu carrito está vacío.';

        let summary = 'Resumen de tu carrito:\n';
        cart.items.forEach((item, index) => {
            summary += `${index + 1}. Item (S/ ${item.price})\n`;
        });
        summary += `Total: S/ ${cart.total}`;
        return summary;
    }

    async getChatHistory(phoneNumber: string): Promise<any[]> {
        const history = await this.historyModel.findOne({ phoneNumber });
        return history ? history.messages.map(m => ({ type: m.role, content: m.content })) : [];
    }

    async saveChatHistory(phoneNumber: string, type: 'human' | 'ai', content: string) {
        let history = await this.historyModel.findOne({ phoneNumber });
        if (!history) {
            history = new this.historyModel({ phoneNumber, messages: [] });
        }
        history.messages.push({ role: type, content, timestamp: new Date() });
        // Keep last 20 messages
        if (history.messages.length > 20) {
            history.messages = history.messages.slice(-20);
        }
        await history.save();
    }
}
