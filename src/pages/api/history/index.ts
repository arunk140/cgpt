import { MongoClient } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const sessionList = await fetchRecentDocuments("chat");
    return res.status(200).json(sessionList);
}

async function fetchRecentDocuments(collectionName: string) {
  const client = new MongoClient(process.env.MONGO_URL || '');
  try {
    await client.connect();
    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection(collectionName);
    const cursor = collection
      .find({}, { projection: { _id: 1, title: 1 } })
      .sort({ ts: -1 })
      .limit(100);
    const recentDocuments = await cursor.toArray();
    return recentDocuments;
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
    return [];
}