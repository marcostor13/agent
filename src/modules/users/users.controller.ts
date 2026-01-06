import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }

    @Post('authorize')
    async authorize(@Body() body: { phoneNumber: string, flowId?: number }) {
        this.logger.log(`Authorizing number: ${body.phoneNumber} with flow: ${body.flowId || 1}`);
        return this.usersService.authorizeUser(body.phoneNumber, body.flowId);
    }

    @Get('authorized')
    async getAuthorized() {
        return this.usersService.getAllAuthorized();
    }
}
