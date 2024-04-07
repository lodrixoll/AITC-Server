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
        const htmlDir = path.join(__dirname, '../html'); // Define the path for the html directory

        // Check if the html directory exists, if not, create it
        if (!fs.existsSync(htmlDir)) {
            fs.mkdirSync(htmlDir, { recursive: true });
        }

        // Iterate over elements and save each page's elements in separate HTML files
        elements.forEach(element => {
            const filePath = path.join(htmlDir, `empty-page-${element.page}.html`);
            // Append the element's HTML content to the corresponding page file
            fs.appendFileSync(filePath, element.html + "\n", { encoding: 'utf8' });
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