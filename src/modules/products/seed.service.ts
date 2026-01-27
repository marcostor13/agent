import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ProductsService } from './products.service';
import { WhatsAppConfigService } from '../whatsapp/whatsapp-config.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly productsService: ProductsService,
        private readonly whatsappConfigService: WhatsAppConfigService,
        private readonly configService: ConfigService,
    ) { }

    async onApplicationBootstrap() {
        this.logger.log('Seeding initial data...');

        // 1. Create or Find Initial WhatsApp Configuration
        const defaultPhoneNumber = this.configService.get<string>('WHATSAPP_PHONE_NUMBER') || '51987654321';
        let config = await this.whatsappConfigService.findByPhoneNumber(defaultPhoneNumber);

        if (!config) {
            this.logger.log('Creating default WhatsApp configuration...');
            config = await this.whatsappConfigService.create({
                name: 'Zimnol Perú - Principal',
                phoneNumber: defaultPhoneNumber,
                phoneNumberId: this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '123456789',
                verifyToken: this.configService.get<string>('WHATSAPP_VERIFY_TOKEN') || 'tokentest',
                accessToken: this.configService.get<string>('WHATSAPP_TOKEN') || 'accesstoken',
                apiVersion: this.configService.get<string>('WHATSAPP_API_VERSION') || 'v17.0',
                systemPrompt: `Eres "LUZ", una experta en moda y vendedora estrella de la tienda Zimnol Perú. Tu objetivo es ayudar a las clientas a encontrar la prenda perfecta y cerrar la venta.
        
REGLA CRÍTICA PARA EL PRIMER MENSAJE:
Si el cliente saluda por primera vez (la historia está vacía), DEBES responder EXACTAMENTE con el siguiente texto y usar la herramienta 'enviar_catalogo_bienvenida' inmediatamente:

"{welcome_message}"

Reglas de Oro posteriores:
1. Sé concisa: Evita párrafos largos. Usa viñetas para listas.
2. Enfocada a Venta: Si una clienta pregunta por algo, busca en el catálogo y ofrece opciones.
3. Gestión de Carrito:
   - Si quiere algo, usa 'agregar_al_carrito'.
   - Si quiere ver qué tiene, usa 'ver_carrito'.
   - Siempre confirma tallas y colores antes de agregar.
4. Cierre de Venta:
   - Cuando la clienta esté lista, usa 'finalizar_pedido'.
   - IMPORTANTE: Después de 'finalizar_pedido', DEBES usar 'enviar_link_pago' para proporcionar el link de pago y las instrucciones finales. No esperes a que la clienta te lo pida. El link de pago es el paso final indispensable.
5. Stock: Si preguntan por disponibilidad, usa 'consultar_stock'.

Flujo de Cierre:
Finalizar Pedido (Recolección de datos) -> Generar Link de Pago -> Despedida amable.`,
                welcomeMessage: `Hola buen día  🙂Te saluda LUZ De zimnol peru. 
Te comento que contamos con promociones especiales en cada modelo de nuestras prendas..

¿Idiqueme  que modelo de prenda le  interesa.?

🌴✨  VESTIDOS PLAYEROS  2026! ✨🌴
✅ MATERIAL
▪️  seda premium, suaves y frescos
▪️ Diseños sublimados en alta resolución, colores que no se despintan
✅ TALLAS DISPONIBLES
 M – L – XL

UNIDAD=50 soles
PROMOCIÓN: 2×89

¡Envíos seguros a Lima y provincias!

✨ Aprovecha y asegura el tuyo antes que se agoten.`,
                welcomeImages: [
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z1.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z2.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z3.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z4.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z5.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z6.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z7.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z8.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z9.jpeg',
                    'https://ba-bucket-aws.s3.us-east-1.amazonaws.com/z10.jpeg'
                ],
                isActive: true,
            });
        }

        // 2. Seed Products for this Config
        this.logger.log(`Seeding products for config ${config.name}...`);

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

        await this.productsService.seedCatalog(catalog as any, config._id.toString());
        this.logger.log('Initial data seeded successfully.');
    }
}
