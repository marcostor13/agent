import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WhatsAppConfig extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    phoneNumber: string;

    @Prop({ required: true, unique: true })
    phoneNumberId: string;

    @Prop({ required: true })
    verifyToken: string;

    @Prop({ required: true })
    accessToken: string;

    @Prop({ required: true, default: 'v17.0' })
    apiVersion: string;

    @Prop({ required: true })
    systemPrompt: string;

    @Prop({ required: true })
    welcomeMessage: string;

    @Prop({ type: [String], default: [] })
    welcomeImages: string[];

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: 1 })
    agentType: number;
}

export const WhatsAppConfigSchema = SchemaFactory.createForClass(WhatsAppConfig);
