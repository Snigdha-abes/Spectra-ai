const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const GPTcloneIndex = pc.Index('cohort-chat-gpt');

async function createMemory({ vectors, metadata, messageID }) {
    await GPTcloneIndex.upsert([ {
        id: messageID,
        values: vectors,
        metadata,
    }]);
};

async function queryMemory({ queryVector, limit = 5, metadata }) {
    const data = await GPTcloneIndex.query({
        vector: queryVector,
        topK: limit,
        includeMetadata: true,
        filter: metadata || undefined,
    })

    return data.matches;
};

module.exports = {
    createMemory,
    queryMemory,
};