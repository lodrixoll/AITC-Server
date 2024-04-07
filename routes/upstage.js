const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const OpenAI = require('openai'); // Ensure OpenAI SDK is required at the top

require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);
const api_key = process.env.UPSTAGE_API_KEY;
const filename = "uploads/user.pdf";
const url = "https://api.upstage.ai/v1/document-ai/layout-analyzer";
const knowledgeUrl = "http://localhost:3001/api/knowledge/fetch"; // Assuming your server runs on localhost:3000

// Creating a form for the file upload
const form = new FormData();
form.append('document', fs.createReadStream(filename));

// Configuring the request, including the headers. The `getHeaders` method of FormData will include the necessary Content-Type
// for multipart/form-data along with the boundary.
const config = {
    headers: {
        ...form.getHeaders(),
        "Authorization": `Bearer ${api_key}`
    }
};

router.post('/', async (req, res) => {
    console.log("\n\n==== NEW UPSTAGE ====");
    
    try {
        const response = await axios.post(url, form, config);
        const elements = response.data.elements;

        // Initialize an object to collect HTML content per page
        let pagesHTML = {};

        // Iterate through elements to collect HTML content per page
        elements.forEach(element => {
            // Ensure the page entry exists in the pagesHTML object
            if (!pagesHTML[element.page]) {
                pagesHTML[element.page] = "";
            }
            // Append the element's HTML to the corresponding page's HTML content
            pagesHTML[element.page] += element.html;
        });

        let documentSummary = "";
        let pageNumber = 1; // Start with page number 1

        // Assuming pagesHTML keys are in the correct order and can be iterated sequentially
        for (let page in pagesHTML) {
            console.log("Parsing Document: " + pageNumber)
            const userPage = pagesHTML[page];
            const emptyPage = await getPageHTML("knowledge/PurchaseAgreementEmpty.pdf", pageNumber); // Use pageNumber in the call
            const unsignedPage = await getPageHTML("knowledge/PurchaseAgreementUnsigned.pdf", pageNumber); // Use pageNumber in the call
            const pageSummary = await validatePage(emptyPage, unsignedPage, userPage); // Await the async call
            documentSummary += pageSummary;
            pageNumber++; // Increment pageNumber for the next iteration
        }

        // Save documentSummary in temporary .txt file
        await fs.promises.mkdir('temp', { recursive: true });
        await fs.promises.writeFile('temp/documentSummary.txt', documentSummary);
        console.log('Document summary saved successfully.');

        // At this point, pagesHTML contains the HTML content for each page
        console.log("UPSTAGED");
        
        // Optionally, you can do something with pagesHTML here, like saving to a database or returning in the response
        res.status(200).json({ message: 'File analyzed and HTML content saved successfully', data: pagesHTML });
    } catch (error) {
        console.error('Error during file analysis:', error.message);
        res.status(500).json({ message: 'Error during file analysis', error: error.message });
    }
});

// Function to fetch a specific page's HTML content based on document title and page number
async function getPageHTML(filename, pageNumber) {
    try {
        // Prepare the request payload
        const payload = {
            title: filename,
            pageNumber: Number(pageNumber)
        };

        // Make a POST request to the /knowledge/fetch endpoint
        const response = await axios.post(knowledgeUrl, payload);

        // Return the HTML content of the requested page
        return response.data.content;
    } catch (error) {
        console.error('Error fetching page HTML:', error.message);
        // Return an error message or null if the request fails
        return null;
    }
}

// Function to validate a single page by comparing the empty, unsigned, and user-submitted versions
async function validatePage(emptyPageHTML, unsignedPageHTML, userPageHTML) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: 'You are a professional real estate transaction compliance expert. Your goal is to help real estate agents determine if a document is compliant. You will be provided with the empty document, the unsigned document, and the user uploaded document as HTML content. It is then your job to make a determination and explain your reasoning.' },
                { role: 'user', content: 'Can you please validate this document?' },
                { role: 'user', content: 'This is the empty page: ' + emptyPageHTML },
                { role: 'user', content: 'This is the full page: ' + unsignedPageHTML },
                { role: 'user', content: 'This is the user submitted page: ' + userPageHTML }
            ]
        });

        // Assuming the response contains a message with the validation result
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error during document validation:', error.message);
        // Return an error message or null if the request fails
        return 'Error during document validation: ' + error.message;
    }
}

module.exports = router;