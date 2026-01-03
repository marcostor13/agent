import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ProductsService } from './products.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedService.name);

    constructor(private readonly productsService: ProductsService) { }

    async onApplicationBootstrap() {
        this.logger.log('Seeding initial products...');

        const catalog = [
            {
                name: 'Vestido Playero Seda Premium',
                description: 'Vestido de seda premium, suave y fresco. Diseños sublimados en alta resolución. Ideal para el verano 2026.',
                category: 'Vestidos',
                price: 50,
                stock: [
                    { size: 'M', color: 'Varios', quantity: 10 },
                    { size: 'L', color: 'Varios', quantity: 15 },
                    { size: 'XL', color: 'Varios', quantity: 10 },
                ],
                metadata: { promotion: '2 x S/ 89' }
            },
            {
                name: 'Short Verano Quick Dry',
                description: 'Short de tela ligera de secado rápido. Cintura elástica con ajuste regulable. Perfecto para playa o piscina.',
                category: 'Shores',
                price: 35,
                stock: [
                    { size: 'S', color: 'Azul', quantity: 20 },
                    { size: 'M', color: 'Negro', quantity: 20 },
                    { size: 'L', color: 'Verde', quantity: 15 },
                ],
                metadata: { promotion: '3 x S/ 90' }
            },
            {
                name: 'Ropa de Baño Control Abdomen',
                description: 'Ropa de baño con protección UV y forro interno. Diseños exclusivos con control de abdomen para mayor comodidad.',
                category: 'Ropa de baño',
                price: 65,
                stock: [
                    { size: 'M', color: 'Floral', quantity: 12 },
                    { size: 'L', color: 'Sólido', quantity: 8 },
                ],
                metadata: { promotion: '2 x S/ 115' }
            }
        ];

        await this.productsService.seedCatalog(catalog as any);
        this.logger.log('Initial products seeded successfully.');
    }
}
