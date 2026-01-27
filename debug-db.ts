import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
}

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();

        const configs = await db.collection('whatsappconfigs').find({}).toArray();
        console.log('WhatsApp Configs Found:', configs.length);
        configs.forEach(c => {
            console.log(`- Name: ${c.name}, PhoneID: ${c.phoneNumberId}, Type: ${c.agentType}, Active: ${c.isActive}`);
        });

        const users = await db.collection('userauths').find({}).toArray();
        console.log('\nAuthorized Users Found:', users.length);
        users.forEach(u => {
            console.log(`- Phone: ${u.phoneNumber}, Flow: ${u.flowId}, Active: ${u.isActive}`);
        });

    } finally {
        await client.close();
    }
}

run().catch(console.dir);
