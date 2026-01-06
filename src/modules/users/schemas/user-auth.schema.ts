import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserAuth extends Document {
    @Prop({ required: true, unique: true })
    phoneNumber: string;

    @Prop({ required: true, default: 1 })
    flowId: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const UserAuthSchema = SchemaFactory.createForClass(UserAuth);
