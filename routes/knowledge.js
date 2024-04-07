const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path'); // Import path module to handle file paths
const Knowledge = require('../models/Knowledge');

require('dotenv').config();

// Endpoint to add new knowledge from pdf
router.post('/add', async (req, res) => {
    console.log("\n\n==== New Knowledge ====")

    // vars
    const api_key = process.env.UPSTAGE_API_KEY;
    const filename = req.body.filename;
    const url = "https://api.upstage.ai/v1/document-ai/layout-analyzer";

    // Creating a form for the file upload
    const form = new FormData();
    form.append('document', fs.createReadStream(filename));

    // config
    const config = {
        headers: {
            ...form.getHeaders(),
            "Authorization": `Bearer ${api_key}`
        }
    };

    // PDF -> HTML request
    axios.post(url, form, config)
    .then(async response => {

        // Iterate over elements and save each page's HTML content in database
        const elements = response.data.elements;

        // log length of elements
        console.log("Length of elements: " + elements.length);

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

        // Iterate through collected pages and save each to the database
        for (const [page, htmlContent] of Object.entries(pagesHTML)) {
            const knowledge = new Knowledge({
                FileName: filename,
                PageNumber: parseInt(page), // Convert page number to integer
                Content: htmlContent
            });
            await knowledge.save();
        }

        console.log("File analyzed and HTML content saved successfully.");
        res.status(200).json({ message: 'File analyzed and HTML content saved successfully'});
    })
    .catch(error => {
        console.error('Error during file analysis:', error.message);
        res.status(500).json({ message: 'Error during file analysis', error: error.message });
    });
});

// Endpoint to fetch a specific page based on document title and page number
router.post('/fetch', async (req, res) => {
    try {
        const { title, pageNumber } = req.body; // Destructure title and pageNumber from request body

        // Find the document in the database based on title and pageNumber
        const pageContent = await Knowledge.findOne({ FileName: title, PageNumber: pageNumber });

        if (!pageContent) {
            return res.status(404).json({ message: `Page ${pageNumber} of document titled "${title}" not found` });
        }

        // If the document is found, send the HTML content as response
        res.status(200).json({ content: pageContent.Content });
    } catch (error) {
        console.error('Error fetching page:', error.message);
        res.status(500).json({ message: 'Error fetching page', error: error.message });
    }
});

module.exports = router;