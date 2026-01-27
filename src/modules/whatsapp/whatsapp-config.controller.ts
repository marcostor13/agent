import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { WhatsAppConfigService } from './whatsapp-config.service';

@Controller('whatsapp-configs')
export class WhatsAppConfigController {
    constructor(private readonly configService: WhatsAppConfigService) { }

    @Post()
    create(@Body() data: any) {
        return this.configService.create(data);
    }

    @Get()
    findAll() {
        return this.configService.findAll();
    }

    @Get(':phoneNumberId')
    findByPhoneNumberId(@Param('phoneNumberId') phoneNumberId: string) {
        return this.configService.findByPhoneNumberId(phoneNumberId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.configService.update(id, data);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.configService.delete(id);
    }
}
