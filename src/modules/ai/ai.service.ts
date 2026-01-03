import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AiService implements OnModuleInit {
    private readonly logger = new Logger(AiService.name);
    private model: ChatOpenAI;
    private embeddings: OpenAIEmbeddings;
    private chain: RunnableSequence;

    constructor(
        private configService: ConfigService,
        private productsService: ProductsService,
        private ordersService: OrdersService,
    ) { }

    async onModuleInit() {
        this.model = new ChatOpenAI({
            openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
            modelName: 'gpt-4o',
            temperature: 0,
        });

        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });

        this.initializeChain();
    }

    private initializeChain() {
        const tools = [
            new DynamicStructuredTool({
                name: 'consultar_catalogo',
                description: 'Busca productos en el catálogo de ropa por descripción semántica o palabras clave.',
                schema: z.object({
                    query: z.string().describe('La descripción del producto o consulta del cliente'),
                }),
                func: async ({ query }) => {
                    const products = await this.productsService.searchProducts(query);
                    if (products.length === 0) return 'No encontré productos que coincidan con esa descripción.';
                    return `Productos encontrados:\n${JSON.stringify(products, null, 2)}`;
                },
            }),
            new DynamicStructuredTool({
                name: 'consultar_stock',
                description: 'Consulta el stock disponible (tallas y colores) de un producto específico.',
                schema: z.object({
                    productId: z.string().describe('El ID del producto'),
                }),
                func: async ({ productId }) => {
                    const products = await this.productsService.getAllProducts();
                    const product = products.find(p => (p as any)._id.toString() === productId);
                    if (!product) return 'Producto no encontrado.';
                    return `Stock disponible para ${product.name}:\n${JSON.stringify(product.stock, null, 2)}`;
                },
            }),
            new DynamicStructuredTool({
                name: 'agregar_al_carrito',
                description: 'Agrega un producto al carrito de compras del cliente.',
                schema: z.object({
                    phoneNumber: z.string().describe('El número de teléfono del cliente'),
                    productId: z.string().describe('El ID del producto'),
                    quantity: z.number().default(1).describe('La cantidad'),
                    size: z.string().describe('La talla elegida'),
                    color: z.string().describe('El color elegido'),
                    price: z.number().describe('El precio unitario'),
                }),
                func: async (input) => {
                    await this.ordersService.addItemToCart(input.phoneNumber, {
                        productId: input.productId,
                        quantity: input.quantity,
                        size: input.size,
                        color: input.color,
                        price: input.price,
                    });
                    return 'Producto agregado al carrito con éxito.';
                },
            }),
            new DynamicStructuredTool({
                name: 'ver_carrito',
                description: 'Muestra un resumen de los productos en el carrito del cliente.',
                schema: z.object({
                    phoneNumber: z.string().describe('El número de teléfono del cliente'),
                }),
                func: async ({ phoneNumber }) => {
                    return await this.ordersService.getCartSummary(phoneNumber);
                },
            }),
            new DynamicStructuredTool({
                name: 'finalizar_pedido',
                description: 'Crea una orden final con los datos del cliente.',
                schema: z.object({
                    phoneNumber: z.string().describe('El número de teléfono del cliente'),
                    customerName: z.string().describe('Nombre completo'),
                    dni: z.string().describe('DNI'),
                    address: z.string().describe('Dirección de entrega'),
                }),
                func: async (input) => {
                    const order = await this.ordersService.createOrder(input.phoneNumber, {
                        customerName: input.customerName,
                        dni: input.dni,
                        address: input.address,
                    });
                    return `Pedido creado con éxito. ID: ${order._id}. Total: S/ ${order.total}. Solicita confirmación de pago.`;
                },
            }),
            new DynamicStructuredTool({
                name: 'enviar_link_pago',
                description: 'Genera y envía un link de pago para una orden específica.',
                schema: z.object({
                    orderId: z.string().describe('El ID de la orden'),
                }),
                func: async ({ orderId }) => {
                    const link = await this.ordersService.generatePaymentLink(orderId);
                    return `Link de pago generado: ${link}. Por favor compártelo con el cliente.`;
                },
            }),
        ];

        const modelWithTools = this.model.bindTools(tools);

        const prompt = ChatPromptTemplate.fromMessages([
            ['system', `Eres LUZ, la experta vendedora estrella de Zimnol Perú.
Tu misión es guiar al cliente en su compra de ropa de verano y cerrar la venta con entusiasmo.

DIRECTRICES:
1. Saludo: "Hola! Soy LUZ de Zimnol Perú. 🙂"
2. Ofertas: Vestidos (2x89), Shorts (3x90), Ropa de Baño (2x115).
3. PROCESO: Consulta catálogo -> Agrega al carrito (necesitas talla/color) -> Finaliza pedido (pide datos) -> Envía link de pago.

IMPORTANTE: Sé directa y vendedora. Una vez creada la orden con 'finalizar_pedido', usa 'enviar_link_pago' para cerrar la venta.`],
            new MessagesPlaceholder('chat_history'),
            ['human', '{input}'],
        ]);

        this.chain = RunnableSequence.from([
            prompt,
            modelWithTools,
            new StringOutputParser(),
        ]);
    }

    async processMessage(input: string, chatHistory: any[] = []) {
        try {
            const response = await this.chain.invoke({
                input,
                chat_history: chatHistory,
            });
            return response;
        } catch (error) {
            this.logger.error(`Error in AI process: ${error.message}`);
            return 'Disculpa, tuve un pequeño inconveniente técnico. ¿Podrías repetirme tu consulta?';
        }
    }
}

