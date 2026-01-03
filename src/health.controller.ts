import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './modules/products/products.service';

@Controller('health')
export class HealthController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async check() {
        const products = await this.productsService.getAllProducts();
        return {
            status: 'ok',
            catalogSize: products.length,
            timestamp: new Date().toISOString(),
        };
    }
}
