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

// validate a user uploaded document with a corresponding validation document
router.post('/validate', async (req, res) => {
    console.log("\n\n==== Validating Document ====");

    const { documentName } = req.body;
    if (!documentName) {
        return res.status(400).send('Document name is required');
    }

    try {
        // Fetch the validation document
        const validationDocument = await Document.findOne({ documentTitle: documentName, type: 'validation' });
        if (!validationDocument) {
            return res.status(404).send('Validation document not found');
        }

        // Fetch the user document
        const userDocument = await Document.findOne({ documentTitle: documentName, type: 'user' });
        if (!userDocument) {
            return res.status(404).send('User document not found');
        }

        for (let i = 0; i < validationDocument.pages.length; i++) {
            const validationPage = validationDocument.pages[i];
            const userPage = userDocument.pages.find(page => page.pageNumber === validationPage.pageNumber);

            const result = await validatePage(validationPage.html, userPage.html);

            console.log(result);
        }

        res.status(200).json({ message: 'Document validation successful' });
    } catch (error) {
        console.error('Error validating document:', error);
        res.status(500).send('Error validating document');
    }
});

async function validatePage(validationHtml, userHtml) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional real estate contract document validator. Your goal is to determine if a user uploaded document is complete or not. 
                              You will make this determination by looking at the user uploaded document and comparing it to the corresponding validation document. 
                              A user uploaded document is considered complete if it meets all of the criteria listed in the corresponding validation document.
                              The validation document was created manually for you to use as a guideline when looking at the user uploaded file.
                              When making your determination you should always look for the presenece of the required information as specified in the validation document.
                              You do not need to pay attention to formatting nor any other specifics. The primary goal is to validate the presenece or lack of particular html elements.
                              The user uploaded document and validation documents are provided as HTML documents and have been created using an external api to convert real estate document PDFs to HTML.
                              The validation document has been manually altered to contain placeholder values (denoted with four underscores). When comparing to a user uploaded file you should expect real names, dates, and signatures from real people.
                              If the user uploaded page is complete, please respond with 'COMPLETE' and explain why. If the user uploaded page is not complete,
                              please respond with 'INCOMPLETE' and explain why in great detail and provide extremely specific examples that support your reasoning. Provide your response as a json object with a "determination" key and a "reason" key.`
                },
                {
                    role: 'user',
                    content: `Is the user uploaded page valid?
                              Validation HTML: ${validationHtml}\n\n
                              User HTML: ${userHtml}`
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



// Add new validation document to database
router.post('/seed-validation-documents', async (req, res) => {
    console.log("\n\n==== Seeding Validation Documents ====")

    // Delete all documents with type 'validation' before adding new ones
    try {
        await Document.deleteMany({ type: 'validation' });
        console.log("Deleted existing validation documents.");
    } catch (error) {
        console.error('Error deleting existing validation documents:', error);
        res.status(500).send('Failed to delete existing validation documents');
        return;
    }

    const directoryPath = path.join(__dirname, '..', 'validation');
    fs.readdir(directoryPath, async (err, files) => {
        if (err) {
            console.error('Could not list the directory.', err);
            res.status(500).send('Failed to list validation documents');
            return;
        }

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const htmlContent = fs.readFileSync(filePath, 'utf8');

            const details = await extractDetails(htmlContent);
            if (!details) {
                console.error('Failed to extract details for file:', file);
                continue; // Skip this file if details extraction fails
            }
            const detailsObj = JSON.parse(details);

            let doc = await Document.findOne({ documentTitle: detailsObj.title, type: 'validation' });
            if (!doc) {
                doc = new Document({
                    type: 'validation',
                    documentTitle: detailsObj.title,
                    totalPages: detailsObj.totalPages,
                    pages: [{
                        pageNumber: detailsObj.currentPage,
                        html: htmlContent,
                    }]
                });
            } else {
                doc.pages.push({
                    pageNumber: detailsObj.currentPage,
                    html: htmlContent,
                });
            }

            await doc.save();
        }

        console.log("Validation documents processed successfully.");
        res.status(200).json({ message: 'Validation documents processed successfully'});
    });
});

// Endpoint to add new document from pdf
router.post('/add', async (req, res) => {
    console.log("\n\n==== Adding New Document ====")

    const type = req.body.type;

    // set up request
    const api_key = process.env.UPSTAGE_API_KEY;
    const filename = req.body.filename; // eventually result from upload route
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
            pagesHTML[element.page] += (element.html + '\n');
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
                    }]
                });
            } else {
                // Append a new page to the existing document
                doc.pages.push({
                    pageNumber: detailsObj.currentPage,
                    html: htmlContent,
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
                    content: 'You are a professional HTML scanner special trained to extract the page title, the total amount of pages, ' +
                            'and the current page information from HTML data. For context this data was created using using an external ' + 
                            'api to convert real estate document PDFs to HTML to capture relevant textual and form data. Please provide the ' +
                            'desired information when given HTML content. If a page title includes page number ' +
                            'information be sure to exclude the page number information from the title. ' +
                            'Be sure to provide the title in all uppercase letters as provided in the HTML. ' +
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

