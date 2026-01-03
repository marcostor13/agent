import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { SeedService } from './seed.service';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ],
    providers: [
        ProductsService,
        SeedService,
        {
            provide: OpenAIEmbeddings,
            useFactory: (configService: ConfigService) => {
                return new OpenAIEmbeddings({
                    openAIApiKey: configService.get<string>('OPENAI_API_KEY'),
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: [ProductsService],
})
export class ProductsModule { }
