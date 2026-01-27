import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhatsAppConfig } from './schemas/whatsapp-config.schema';

@Injectable()
export class WhatsAppConfigService {
    constructor(
        @InjectModel(WhatsAppConfig.name)
        private readonly configModel: Model<WhatsAppConfig>,
    ) { }

    async create(data: any): Promise<WhatsAppConfig> {
        return this.configModel.create(data);
    }

    async findAll(): Promise<WhatsAppConfig[]> {
        return this.configModel.find({ isActive: true }).exec();
    }

    async findByPhoneNumberId(phoneNumberId: string): Promise<WhatsAppConfig> {
        const config = await this.configModel.findOne({ phoneNumberId, isActive: true }).exec();
        if (!config) {
            throw new NotFoundException(`WhatsApp config with ID ${phoneNumberId} not found`);
        }
        return config;
    }

    async findByPhoneNumber(phoneNumber: string): Promise<WhatsAppConfig | null> {
        return this.configModel.findOne({ phoneNumber, isActive: true }).exec();
    }

    async update(id: string, data: any): Promise<WhatsAppConfig | null> {
        return this.configModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<any> {
        return this.configModel.findByIdAndDelete(id).exec();
    }
}
