import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAuth } from './schemas/user-auth.schema';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(UserAuth.name) private userAuthModel: Model<UserAuth>,
    ) { }

    async authorizeUser(phoneNumber: string, flowId: number = 1) {
        return this.userAuthModel.findOneAndUpdate(
            { phoneNumber },
            { flowId, isActive: true },
            { upsert: true, new: true },
        );
    }

    async deauthorizeUser(phoneNumber: string) {
        return this.userAuthModel.findOneAndUpdate(
            { phoneNumber },
            { isActive: false },
            { new: true },
        );
    }

    async getAuthorization(phoneNumber: string) {
        return this.userAuthModel.findOne({ phoneNumber, isActive: true });
    }

    async getAllAuthorized() {
        return this.userAuthModel.find({ isActive: true });
    }
}
