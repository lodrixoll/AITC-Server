const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path'); // Import path module to handle file paths
const Knowledge = require('../models/KnowledgePage');
const OpenAI = require('openai');

require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

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

router.post('/seed', async (req, res) => {
    try {
        // Drop all items from the knowledge database
        console.log("Dropping all items from the knowledge database...");
        await Knowledge.deleteMany({});

        console.log("Reading PDF files...");
        const pdfFiles = {
            empty: 'EmptyPA.pdf',
            filled: 'FilledPA.pdf'
        };
        const url = "https://api.upstage.ai/v1/document-ai/layout-analyzer";
        const api_key = process.env.UPSTAGE_API_KEY;

        const formDataEmpty = new FormData();
        formDataEmpty.append('document', fs.createReadStream(path.join(__dirname, '../knowledge', pdfFiles.empty)));

        const formDataFilled = new FormData();
        formDataFilled.append('document', fs.createReadStream(path.join(__dirname, '../knowledge', pdfFiles.filled)));

        const configEmpty = {
            headers: {
                ...formDataEmpty.getHeaders(),
                "Authorization": `Bearer ${api_key}`
            }
        };

        const configFilled = {
            headers: {
                ...formDataFilled.getHeaders(),
                "Authorization": `Bearer ${api_key}`
            }
        };

        console.log("Uploading PDF files to Upstage...");
        const [responseEmpty, responseFilled] = await Promise.all([
            axios.post(url, formDataEmpty, configEmpty),
            axios.post(url, formDataFilled, configFilled)
        ]);

        const elementsEmpty = responseEmpty.data.elements;
        const elementsFilled = responseFilled.data.elements;

        let pagesHTML = {};
        elementsEmpty.forEach((element, index) => {
            const page = element.page;
            if (!pagesHTML[page]) {
                pagesHTML[page] = { emptyContent: "", completedContent: "" };
            }
            pagesHTML[page].emptyContent += element.html;
            pagesHTML[page].completedContent += elementsFilled[index].html;
        });
        console.log("PDF files uploaded to Upstage.");

        console.log("Saving HTML content to database...");
        for (const [page, { emptyContent, completedContent }] of Object.entries(pagesHTML)) {
            const knowledge = new Knowledge({
                documentTitle: await getTitle(emptyContent),
                pageNumber: parseInt(page),
                emptyContent: emptyContent,
                completedContent: completedContent,
                complianceChecklist: '', // Assuming no initial data
                metaDescription: '' // Assuming no initial data
            });
            await knowledge.save();
        }
        console.log("HTML content saved to database.");
        res.status(200).json({ message: 'PDFs seeded successfully' });
    } catch (error) {
        console.error('Error during seeding:', error.message);
        res.status(500).json({ message: 'Error during seeding', error: error.message });
    }
});

// Endpoint to save HTML content of a specific page to files
router.post('/save-html', async (req, res) => {
    try {
        const { pageNumber } = req.body;
        const pageContents = await Knowledge.find({ pageNumber: pageNumber });

        if (!pageContents.length) {
            return res.status(404).json({ message: `No documents found with page number ${pageNumber}` });
        }

        // Ensure the directory exists
        const dirPath = path.join(__dirname, '../html');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        // Save each document's HTML content to separate files for emptyContent and completedContent
        pageContents.forEach((content, index) => {
            const emptyFilePath = path.join(dirPath, `Page_${pageNumber}_Empty.html`);
            const completedFilePath = path.join(dirPath, `Page_${pageNumber}_Completed.html`);

            fs.writeFileSync(emptyFilePath, content.emptyContent);
            fs.writeFileSync(completedFilePath, content.completedContent);
        });

        res.status(200).json({ message: `HTML content of page ${pageNumber} saved successfully` });
    } catch (error) {
        console.error('Error saving HTML files:', error.message);
        res.status(500).json({ message: 'Error saving HTML files', error: error.message });
    }
});

// helper function used to get title & page number from html content
async function getTitle(htmlContent) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI trained to extract document titles from HTML content. Please provide the title when given HTML content. Provide your response as the identified title ONLY.'
                },
                {
                    role: 'user',
                    content: `Please extract the title from this HTML: ${htmlContent}.`
                }
            ]
        });

        // Assuming the response contains a message with the extracted title and page number
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error extracting title and page number:', error.message);
        return null;
    }
}

// sample post request to test the get title function with dummy html data 
router.post('/test-title', async (req, res) => {
    const htmlContent = "<html><head><title>Test Title</title></head><body><h1>Page 1</h1><p>Test content</p></body></html>";
    const title = await getTitle(htmlContent);
    res.status(200).json({ title: title });
});



module.exports = router;

