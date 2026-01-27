import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
    @Prop({ required: true, index: true })
    phoneNumber: string;

    @Prop({ type: Types.ObjectId, ref: 'WhatsAppConfig', required: true, index: true })
    whatsappConfigId: Types.ObjectId;

    @Prop({ required: true })
    customerName: string;

    @Prop()
    dni?: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    district: string;

    @Prop([{
        productId: { type: Types.ObjectId, ref: 'Product' },
        quantity: Number,
        size: String,
        color: String,
        price: Number,
    }])
    items: Array<{
        productId: Types.ObjectId;
        quantity: number;
        size: string;
        color: string;
        price: number;
    }>;

    @Prop({ required: true })
    total: number;

    @Prop({ default: 'pending', enum: ['pending', 'paid', 'delivered', 'cancelled'] })
    status: string;

    @Prop()
    paymentLink?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
