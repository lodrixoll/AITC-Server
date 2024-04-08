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
            documentSummary += `\n\n\-------------- END OF PAGE ${pageNumber} -------------------\n\n`;
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

router.post('/test', async (req, res) => {
    console.log("\n\n==== NEW TEST ====");
    
    try {
        // Create the temp directory if it doesn't exist
        await fs.promises.mkdir('temp', { recursive: true });
        // Initialize the path for the document summary file
        const summaryFilePath = 'temp/documentSummary.txt';
        // Ensure the file is empty before starting to append text
        await fs.promises.writeFile(summaryFilePath, '');

        for (let i = 1; i < 28; i++) {
            console.log("Parsing Document: " + i);
            const userPage = await getPageHTML("knowledge/bad.pdf", i);
            const emptyPage = await getPageHTML("knowledge/PurchaseAgreementEmpty.pdf", i);
            const unsignedPage = await getPageHTML("knowledge/PurchaseAgreementUnsigned.pdf", i);
            const pageSummary = await validatePage(emptyPage, unsignedPage, userPage);

            // Append the current page's summary to the document summary file
            await fs.promises.appendFile(summaryFilePath, `\n\n\-------------- BEGIN PAGE ${i} ANALYSIS -------------------\n\n` + 
                                                           pageSummary + 
                                                          `\n\n\-------------- END PAGE ${i} ANALYSIS -------------------\n\n`);
        }

        console.log('Document summary saved successfully.');

        // Optionally, you can do something with pagesHTML here, like saving to a database or returning in the response
        res.status(200).json({ message: 'File analyzed and HTML content saved successfully', data: {} }); // Updated to reflect that pagesHTML is not used here
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
                { 
                    role: 'system', 
                    content: 
                        'You are a professional real estate transaction coordinator expert. ' +
                        'Your task is to determine if a given transaction document is compliant or not. ' +
                        'You have access to the unfilled version of the document, a filled & compliant ' + 
                        'version of the document, and the corresponding user submitted document. ' +
                        'You will accomplish this goal by first comparing the unfilled version of the document ' +
                        'with the compliant version to determine what fields are necessary to consider this document compliant.' +
                        'Then you will compare these findings with the user submitted document to make a final compliance determination of the user uploaded document. ' +
                        'The filled document has been prepoulated with fake sample data to show you the desired format ONLY. ' +
                        'All of the documents will be provided as HTML content. ' + 
                        'For further context the HTML content was generated using OCR on PDF documents so pay NO attention to typos in names & improper HTML formatting. ' +
                        'Additionally the user submitted documents were signed & generated using DocuSign. ' +
                        'The OCR technology sometimes does not work as expected and the signature data gets transcribed as an incorrect (but similar) version of the printed name. ' +
                        'Make sure to not be too strict when considering format - make sure to look for nearby HTML elements that might be relevant including dates, times, printed names, and potential signatures!' +
                        'Remeber that if there is space for multiple buyers in the empty document but only one has ' +
                        'signed in the user uploaded document then that is still considered compliant because typically only one person is listed as buying a particular property. ' +
                        'Take a deep breath and relax. Remember to think of a plan first then proceed slowly and step by step.' +
                        'Respond with a single word: COMPLIANT or NOT COMPLIANT only. ' +
                        'If not compliant list the actions that must be taken to make it compliant. '
                },
                { role: 'user', content: 'Can you please validate this purchase agreement document?' },
                { role: 'user', content: 'This is the empty document: ' + emptyPageHTML },
                { role: 'user', content: 'This is the filled document: ' + unsignedPageHTML },
                { role: 'user', content: 'This is the user submitted document: ' + userPageHTML }
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