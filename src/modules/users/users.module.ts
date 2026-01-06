import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAuth, UserAuthSchema } from './schemas/user-auth.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserAuth.name, schema: UserAuthSchema }]),
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
