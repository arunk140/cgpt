import type { NextApiRequest, NextApiResponse } from 'next';
import { queryLanguageModel, formatOpenAIInput } from './index';
import { getDocumentFromCollectionById } from '../history/[id]';
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    const { message, userId } = JSON.parse(req.body) as { message: string, userId: string};
    const { id } = req.query as { id: string};
    var doc = await getDocumentFromCollectionById("chat", id, userId);
    if (!doc) {
        return res.status(404).json({
            error: "No conversation found with id: " + id
        });
    }
    let { userLabel, chatGPTLabel, endToken, startPrompt, history } = doc;

    let prompt = formatOpenAIInput(startPrompt, history, endToken, userLabel, chatGPTLabel);
    let question = message;
    prompt += "\n" + userLabel + question + "\n" + chatGPTLabel;
    let op = await queryLanguageModel(prompt);

    doc.history.push({
        "input": question,
        "output": op,
        "timestamp": new Date().getTime()
    });

    const done = await updateDocumentInCollection("chat", id, doc.history, userId);

    return res.status(200).json({
        response: op
    });
}

async function updateDocumentInCollection(collectionName: string, id: string, history: any[], userId: string) {
    const client = new MongoClient(process.env.MONGO_URL || '');
    try {
        await client.connect();
        const db = client.db(process.env.MONGO_DB);
        const collection = await db.collection(collectionName);
        const query = { _id: ObjectId.createFromHexString(id) };
        const updateDoc = {
            $set: {
                history: history,
                userId: userId
            }
        };
        const result = await collection.updateOne(query, updateDoc);
        return result.modifiedCount;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return null;
}