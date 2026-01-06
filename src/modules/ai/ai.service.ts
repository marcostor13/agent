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

@Injectable()
export class AiService implements OnModuleInit {
    private readonly logger = new Logger(AiService.name);
    private model: ChatOpenAI;
    private embeddings: OpenAIEmbeddings;
    private agentExecutor: AgentExecutor;

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

        await this.initializeAgent();
    }

    private async initializeAgent() {
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
            new DynamicStructuredTool({
                name: 'enviar_catalogo_bienvenida',
                description: 'Envía las 10 imágenes del catálogo de bienvenida de "Zimnol Perú". Úsalo solo cuando el cliente salude por primera vez.',
                schema: z.object({
                    phoneNumber: z.string().describe('El número de teléfono del cliente'),
                }),
                func: async ({ phoneNumber }) => {
                    const baseUrl = this.configService.get<string>('APP_URL') || 'http://marcostorresalarcon.com:3028';
                    const images = ['foto1.jpg', 'foto2.jpg', 'foto3.jpg', 'foto4.jpg', 'foto5.jpg', 'foto6.jpg', 'foto7.jpg', 'foto8.jpg', 'foto9.jpg', 'foto10.jpg'];
                    for (const img of images) {
                        try {
                            await this.whatsappService.sendImageMessage(phoneNumber, `${baseUrl}/public/images/${img}`);
                        } catch (e) {
                            this.logger.error(`Error sending welcome image ${img}: ${e.message}`);
                        }
                    }
                    return 'Imágenes de bienvenida enviadas.';
                },
            }),
        ];

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

        this.agentExecutor = new AgentExecutor({
            agent,
            tools,
            verbose: true,
        });
    }

    async processMessage(content: string, history: BaseMessage[], flowId: number = 1) {
        try {
            const systemPrompt = this.getSystemPrompt(flowId);

            const response = await this.agentExecutor.invoke({
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

    private getSystemPrompt(flowId: number): string {
        switch (flowId) {
            case 1:
            default:
                return `Eres "LUZ", una experta en moda y vendedora estrella de la tienda Zimnol Perú. Tu objetivo es ayudar a las clientas a encontrar la prenda perfecta y cerrar la venta.
        
REGLA CRÍTICA PARA EL PRIMER MENSAJE:
Si el cliente saluda por primera vez (la historia está vacía), DEBES responder EXACTAMENTE con el siguiente texto y usar la herramienta 'enviar_catalogo_bienvenida' inmediatamente:

"Hola buen día  🙂Te saluda LUZ De zimnol peru. 
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

✨ Aprovecha y asegura el tuyo antes que se agoten."

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
Finalizar Pedido (Recolección de datos) -> Generar Link de Pago -> Despedida amable.`;
        }
    }
}
