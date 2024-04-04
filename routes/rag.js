const express = require('express');
const router = express.Router();
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { pull } = require("langchain/hub");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const fs = require('fs');
const path = require('path');

require('dotenv').config();


// rag endpoint
router.post('/', async (req, res) => {

    console.log("\n\n==== New RAG ====")

    // Extract the unique ID from the request body
    const uniqueId = req.body.uniqueId;
    if (!uniqueId) {
        return res.status(400).json({ message: "Unique ID is required" });
    }

    // Construct the file path using the unique ID
    const filePath = path.join(__dirname, '..', 'uploads', uniqueId + '.pdf');

    // load docs
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} documents`)

    // split the documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    });
    const splits = await textSplitter.splitDocuments(docs);

    // create a vector store from the splits
    const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings()
    );

    // Retrieve and generate using the relevant snippets of the blog.
    const retriever = vectorStore.asRetriever(20);
    const prompt = await pull("rlm/rag-prompt");
    const llm = new ChatOpenAI({ modelName: "gpt-4-turbo-preview", temperature: 0 });

    // create chain
    const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
    });

    // Assuming temp.txt is in the same directory as rag.js
    const documentPath = path.join(__dirname, '..', 'documents', 'Page7.txt');
    const documentContent = fs.readFileSync(documentPath, 'utf8');
    const retrievedDocs = await retriever.getRelevantDocuments(documentContent);
    console.log(`Retrieved ${retrievedDocs.length} documents`)
    
    // perform the rag
    response = await ragChain.invoke({
        question: "What is the property address, total price, and what " + 
                  "are the names of the people that are the Seller, " + 
                  "Listing Agent, Listing Broker, Buyer, Buyer's Agent, " + 
                  "Buyer's Broker, in this real estate purchase agreement? " + 
                  "Your response will be used in production code therefore you are required to respond in the following format " + 
                  "{ \"address\": \"Identified address...\", \"price\": \"Identified total price...\", \"Seller\": \"Identified Seller...\", \"Listing Agent\": \"Identified Listing Agent...\", \"Listing Broker\": \"Identified Listing Broker...\", \"Buyer\": \"Identified Buyer...\", \"Buyer's Agent\": \"Identified Buyer's Agent...\", \"Buyer's Broker\": \"Identified Buyer's Broker...\" } " + 
                  "Do not include any markdown in your response or preceed your response with special characters.",
        context: retrievedDocs,
      });
    console.log(response);
    
    // send the response
    res.json(JSON.parse(response));
});

// Static routes
router.post('/static', async (req, res) => {
  console.log("\n\n==== /api/rag/static ====")
  res.json({address: "1191 Loma Court", Seller: "Diana Winkler", "Listing Agent": "Stewart L. Moore", "Listing Broker": "Engel & Volkers Sonoma County", "Buyer": "Prem Moktan", "Buyer's Agent": "Niccolo Pigni", "Buyer's Broker": "Engel & Volkers" });
});

router.post('/static/roles', async (req, res) => {
  console.log("\n\n==== /api/rag/static/roles ====")
  res.json({ "Seller": "Diana Winkler", "Listing Agent": "Stewart L. Moore", "Listing Broker": "Engel & Volkers Sonoma County", "Buyer": "Prem Moktan", "Buyer's Agent": "Niccolo Pigni", "Buyer's Broker": "Engel & Volkers" });
});

router.post('/static/address', async (req, res) => {
  console.log("\n\n==== /api/rag/static/address ====")
  res.json({address: "1191 Loma Court"});
});


module.exports = router;