import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: ['Vestidos', 'Shores', 'Ropa de baño'] })
    category: string;

    @Prop({ required: true })
    price: number;

    @Prop({ default: 'PEN' })
    currency: string;

    @Prop({ type: [{ size: String, color: String, quantity: Number }], default: [] })
    stock: { size: string; color: string; quantity: number }[];

    @Prop([String])
    images: string[];

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;

    @Prop({ type: [Number], index: '2dsphere', select: false }) // Simplified for now, Mongo Atlas Search handles vectors differently
    embedding: number[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
