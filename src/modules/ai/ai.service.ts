import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { BaseMessage } from '@langchain/core/messages';
import { WhatsAppConfig } from '../whatsapp/schemas/whatsapp-config.schema';

@Injectable()
export class AiService implements OnModuleInit {
    private readonly logger = new Logger(AiService.name);
    private model: ChatOpenAI;
    private embeddings: OpenAIEmbeddings;

    constructor(
        private configService: ConfigService,
        private productsService: ProductsService,
        private ordersService: OrdersService,
        @Inject(forwardRef(() => WhatsappService))
        private whatsappService: WhatsappService,
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
    }

    private getTools(config: WhatsAppConfig) {
        const whatsappConfigId = config._id.toString();

        if (config.agentType === 2) {
            return [
                new DynamicStructuredTool({
                    name: 'create_order',
                    description: 'Envía un pedido de delivery al sistema de cocina de Caldos Doris',
                    schema: z.object({
                        type: z.enum(['delivery']).describe('Tipo de orden, siempre es delivery'),
                        items: z.array(z.object({
                            productId: z.string().describe('El ID del producto según la tabla del menú'),
                            quantity: z.number().int().describe('Cantidad de platos'),
                        })),
                        customerName: z.string().describe('Nombre completo del cliente'),
                        customerPhone: z.string().describe('Teléfono del cliente'),
                        deliveryAddress: z.string().describe('Dirección de entrega (Calle y número)'),
                        district: z.string().describe('Distrito de la ciudad (ej: San Isidro, Miraflores)'),
                    }),
                    func: async (input) => {
                        try {
                            const order = await this.ordersService.createDirectOrder(input.customerPhone, whatsappConfigId, input, this.productsService);
                            return `Pedido creado con éxito. ID: ${order._id}. Total: S/ ${order.total}.`;
                        } catch (error) {
                            return `Error al crear el pedido: ${error.message}`;
                        }
                    },
                }),
            ];
        }

        return [
            new DynamicStructuredTool({
                name: 'consultar_catalogo',
                description: 'Busca productos en el catálogo de ropa por descripción semántica o palabras clave.',
                schema: z.object({
                    query: z.string().describe('La descripción del producto o consulta del cliente'),
                }),
                func: async ({ query }) => {
                    const products = await this.productsService.searchProducts(query, whatsappConfigId);
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
                    const products = await this.productsService.getAllProducts(whatsappConfigId);
                    const product = products.find(p => (p as any)._id.toString() === productId);
                    if (!product) return 'Producto no encontrado.';
                    return `Stock disponible for ${product.name}:\n${JSON.stringify(product.stock, null, 2)}`;
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
                    await this.ordersService.addItemToCart(input.phoneNumber, whatsappConfigId, {
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
                    return await this.ordersService.getCartSummary(phoneNumber, whatsappConfigId);
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
                    const order = await this.ordersService.createOrder(input.phoneNumber, whatsappConfigId, {
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
            new DynamicStructuredTool({
                name: 'enviar_catalogo_bienvenida',
                description: 'Envía las imágenes del catálogo de bienvenida. Úsalo solo cuando el cliente salude por primera vez.',
                schema: z.object({
                    phoneNumber: z.string().describe('El número de teléfono del cliente'),
                }),
                func: async ({ phoneNumber }) => {
                    const images = config.welcomeImages;
                    if (!images || images.length === 0) return 'No hay imágenes de catálogo configuradas.';

                    // Enviamos las imágenes con un pequeño retraso para asegurar que lleguen después del texto
                    setTimeout(async () => {
                        for (const imageUrl of images) {
                            try {
                                await this.whatsappService.sendImageMessage(phoneNumber, imageUrl, config);
                                // Un pequeño respiro entre imágenes (500ms)
                                await new Promise(resolve => setTimeout(resolve, 500));
                            } catch (e) {
                                this.logger.error(`Error sending welcome image ${imageUrl}: ${e.message}`);
                            }
                        }
                    }, 2500);

                    return 'Catálogo de imágenes enviado (se enviarán en unos momentos después del saludo).';
                },
            }),
        ];
    }

    async processMessage(content: string, history: BaseMessage[], config: WhatsAppConfig) {
        try {
            const tools = this.getTools(config);
            const prompt = ChatPromptTemplate.fromMessages([
                ['system', '{system_prompt}'],
                new MessagesPlaceholder('chat_history'),
                ['human', '{input}'],
                new MessagesPlaceholder('agent_scratchpad'),
            ]);

            const agent = await createOpenAIToolsAgent({
                llm: this.model,
                tools,
                prompt,
            });

            const executor = new AgentExecutor({
                agent,
                tools,
                verbose: true,
            });

            const systemPrompt = config.systemPrompt.replace('{welcome_message}', config.welcomeMessage);

            const response = await executor.invoke({
                input: content,
                chat_history: history,
                system_prompt: systemPrompt,
            });
            return response.output;
        } catch (error) {
            this.logger.error(`Error in AI process: ${error.message}`);
            return 'Disculpa, tuve un pequeño inconveniente técnico. ¿Podrías repetirme tu consulta?';
        }
    }
}
