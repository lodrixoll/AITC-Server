const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const OpenAI = require('openai');

require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);


// test endpoint by logging something to console and return success
router.get('/test', (req, res) => {
    console.log('test');
    res.send('success');
});

// Endpoint to add new knowledge from pdf
router.post('/add', async (req, res) => {
    console.log("\n\n==== Adding New Document ====")

    const type = req.body.type;

    // set up request
    const api_key = process.env.UPSTAGE_API_KEY;
    const filename = req.body.filename;
    const url = "https://api.upstage.ai/v1/document-ai/layout-analyzer";
    const form = new FormData();
    form.append('document', fs.createReadStream(filename));
    const config = {
        headers: {
            ...form.getHeaders(),
            "Authorization": `Bearer ${api_key}`
        }
    };

    // make request to upstage
    console.log("Uploading file to Upstage...")
    axios.post(url, form, config)
    .then(async response => {

        const elements = response.data.elements;
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

        // Iterate through collected pages and save each to the database
        for (const [page, htmlContent] of Object.entries(pagesHTML)) {

            // extract title, totalPages, and currentPage from html content
            const details = await extractDetails(htmlContent);
            const detailsObj = JSON.parse(details);

            // Check if a document with the title & type already exists
            let doc = await Document.findOne({ documentTitle: detailsObj.title, type: type });

            if (!doc) {
                // Create a new document if it does not exist
                doc = new Document({
                    type: type,
                    documentTitle: detailsObj.title,
                    totalPages: detailsObj.totalPages,
                    pages: [{
                        pageNumber: detailsObj.currentPage,
                        html: htmlContent,
                        stylesheet: "", // hardcoded to blank
                    }]
                });
            } else {
                // Append a new page to the existing document
                doc.pages.push({
                    pageNumber: detailsObj.currentPage,
                    html: htmlContent,
                    stylesheet: "", // hardcoded to blank
                });
            }

            // Save the document
            await doc.save();
        }

        console.log("File analyzed and HTML content saved successfully.");
        res.status(200).json({ message: 'File analyzed and HTML content saved successfully'});
    })
    .catch(error => {
        console.error('Error during file analysis:', error.message);
        res.status(500).json({ message: 'Error during file analysis', error: error.message });
    });
});

// helper function used to get title, total pages, and current page number from html content
async function extractDetails(htmlContent) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI trained to extract the page title, the total amount of pages, ' +
                            'and the current page information from real estate documents. Please provide the ' +
                            'desired information when given HTML content. If a page title includes page number ' +
                            'information be sure to exclude the page number information from the title. ' +
                            'Provide your response as a JSON object with the keys: title, totalPages, and currentPage. ' +
                            'Do not preceed your response with the word json nor any special characters.'
                },
                {
                role: 'user',
                content: `Please extract the title, total pages, and current page from this HTML: ${htmlContent}.`
                }
            ],
            response_format: { type: "json_object" },
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error extracting details:', error.message);
        return null;
    }
}


module.exports = router;

