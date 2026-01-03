import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatHistory extends Document {
    @Prop({ required: true, unique: true })
    phoneNumber: string;

    @Prop([{
        role: { type: String, enum: ['human', 'ai'] },
        content: String,
        timestamp: { type: Date, default: Date.now },
    }])
    messages: Array<{
        role: 'human' | 'ai';
        content: string;
        timestamp: Date;
    }>;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
