const express = require('express');
const router = express.Router();

const cheerio = require("cheerio");
const { CheerioWebBaseLoader } = require("langchain/document_loaders/web/cheerio");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { pull } = require("langchain/hub");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");

require('dotenv').config();

// Chat endpoint
router.post('/', async (req, res) => {

    console.log("\n\n==== RAG Chat ====")

    const loader = new CheerioWebBaseLoader(
    "https://lilianweng.github.io/posts/2023-06-23-agent/"
    );
    console.log("Loader created")

    const docs = await loader.load();
    console.log("Documents loaded")

    const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    });
    const splits = await textSplitter.splitDocuments(docs);
    console.log("Documents split")

    const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings()
    );
    console.log("Vector store created")

    // Retrieve and generate using the relevant snippets of the blog.
    const retriever = vectorStore.asRetriever();
    console.log("Retriever created")

    const prompt = await pull("rlm/rag-prompt");
    console.log("Prompt pulled")

    const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 });
    console.log("LLM created")

    const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
    });
    console.log("RAG chain created")

    const retrievedDocs = await retriever.getRelevantDocuments(
    "what is task decomposition"
    );
    console.log("Documents retrieved")

    response = await ragChain.invoke({
        question: "What is task decomposition?",
        context: retrievedDocs,
      });
    console.log(response);

    // send response
    res.json({ response: response });
});

module.exports = router;