import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cart extends Document {
    @Prop({ required: true, index: true })
    phoneNumber: string;

    @Prop({ type: Types.ObjectId, ref: 'WhatsAppConfig', required: true, index: true })
    whatsappConfigId: Types.ObjectId;

    @Prop([{
        productId: { type: Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
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

    @Prop({ default: 0 })
    total: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ phoneNumber: 1, whatsappConfigId: 1 }, { unique: true });
