import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';

@Injectable()
export class ProductsService implements OnModuleInit {
    private readonly logger = new Logger(ProductsService.name);
    private vectorStore: MongoDBAtlasVectorSearch;

    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        private embeddings: OpenAIEmbeddings,
    ) { }

    async onModuleInit() {
        // Initialize vector store with MongoDB collection
        const collection = (this.productModel.db.collection('products') as any);

        this.vectorStore = new MongoDBAtlasVectorSearch(this.embeddings, {
            collection,
            indexName: 'vector_index', // Make sure this index exists in Atlas
            textKey: 'description',
            embeddingKey: 'embedding',
        });
    }

    async searchProducts(query: string, limit = 3) {
        try {
            this.logger.log(`Searching products for: ${query}`);
            const results = await this.vectorStore.similaritySearch(query, limit);
            return results.map(doc => doc.metadata);
        } catch (error) {
            this.logger.error(`Error searching products: ${error.message}`);
            return [];
        }
    }

    async seedCatalog(products: any[]) {
        for (const prod of products) {
            const exists = await this.productModel.findOne({ name: prod.name });
            if (!exists) {
                const product = new this.productModel(prod);
                // Generate embedding for description
                if (prod.description) {
                    const embedding = await this.embeddings.embedQuery(prod.description);
                    product.set('embedding', embedding);
                }
                await product.save();
                this.logger.log(`Product seeded: ${prod.name}`);
            }
        }
    }

    async getAllProducts() {
        return this.productModel.find().exec();
    }
}
