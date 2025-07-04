import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '../utils/pinecone-client.js';

import dotenv from 'dotenv';
dotenv.config();

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE;
/* It is the Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/

export async function getContext(query){
  try {
    console.log('loading vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); 

    
    let store = await PineconeStore.fromExistingIndex(embeddings ,  {
    pineconeIndex: index,
    namespace: PINECONE_NAME_SPACE,
    textKey: 'text',
  });
    return await store.similaritySearchWithScore(query);
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to load your data');
  }
}


