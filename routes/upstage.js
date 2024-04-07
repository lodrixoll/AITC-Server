const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path'); // Import path module to handle file paths

require('dotenv').config();

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

router.post('/', (req, res) => {
    console.log("\n\n==== NEW UPSTAGE ====");
    
    // Making the POST request
    axios.post(url, form, config)
    .then(response => {
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

        //for page in pagesHTML
        let pageNumber = 1;
        for (let page in pagesHTML) {
            userPage = page;
            emptyPage = getPageHTML("knowledge/PurchaseAgreementEmpty.pdf", pageNumber)
            unsignedPage = getPageHTML("knowledge/PurchaseAgreementUnsigned.pdf", pageNumber)
            pageNumber++;
        }

        // At this point, pagesHTML contains the HTML content for each page
        console.log("UPSTAGED");
        
        // Optionally, you can do something with pagesHTML here, like saving to a database or returning in the response
        res.status(200).json({ message: 'File analyzed and HTML content saved successfully', data: pagesHTML });
    })
    .catch(error => {
        console.error('Error during file analysis:', error.message);
        res.status(500).json({ message: 'Error during file analysis', error: error.message });
    });
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

module.exports = router;