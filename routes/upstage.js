const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path'); // Import path module to handle file paths

require('dotenv').config();

const api_key = process.env.UPSTAGE_API_KEY;
const filename = "uploads/empty.pdf";
const url = "https://api.upstage.ai/v1/document-ai/layout-analyzer";

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
    console.log("Starting file analysis...");

    // Making the POST request
    axios.post(url, form, config)
    .then(response => {
        const elements = response.data.elements;
        let pageNumber = 0;

        elements.forEach(element => {
            userPage = element.html;
            // make post request to /knowledge/document
            emptyPage = getPage("knowledge/PurchaseAgreementEmpty.pdf", pageNumber);
            signedPage = getPage("knowledge/PurchaseAgreementSigned.pdf", pageNumber);
        });
        console.log("File analyzed and HTML content saved successfully.");
        
        res.status(200).json({ message: 'File analyzed and HTML content saved successfully', data: response.data });
    })
    .catch(error => {
        console.error('Error during file analysis:', error.message);
        res.status(500).json({ message: 'Error during file analysis', error: error.message });
    });
})

module.exports = router;