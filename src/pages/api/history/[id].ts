import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const { id, userId } = req.query;
    const collection = await getDocumentFromCollectionById("chat", id, userId);
    if (!collection) {
        return res.status(200).json({
            history: []
        });
    }
    collection.history.shift();
    collection.history.forEach((hs: any) => {
        hs.output = hs.output.replace(/<\|im_end\|>$/, '');
    });
    return res.status(200).json({
        history: collection.history
    });
}

export async function getDocumentFromCollectionById(
    collectionName: string,
    id: any,
    userId: any
) {
    const client = new MongoClient(process.env.MONGO_URL || '');
    try {

        await client.connect();
        const db = client.db(process.env.MONGO_DB);
        const collection = db.collection(collectionName);
        
        const query = { _id: ObjectId.createFromHexString(id), userId: userId};
        const res = await collection.findOne(query);
        return res;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return null;
}