const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const fs = require('fs');

require('dotenv').config();

// Initialize OpenAI with your API key
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Chat endpoint
router.post('/', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Hello! How can I help you today?' },
                { role: 'user', content: message }
            ]
        });
        res.json({ response: response.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Test endpoint
router.post('/test', async (req, res) => {
    console.log('==== TEST ====');

    try {
        // Read the content of page 7 from the HTML documents folder
        const userPageHTML = fs.readFileSync('html/user-page-1.html', 'utf8');
        const fullPageHTML = fs.readFileSync('html/full-page-1.html', 'utf8');
        const emptyPageHTML = fs.readFileSync('html/empty-page-1.html', 'utf8');

        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: 'You are a professional real estate transaction compliance expert. Your goal is to help real estate agents determine if a document is compliant. You will be provided with the empty document, the unsigned document, and the user uploaded document as HTML content. It is then your job to make a determination and explain your reasoning.' },
                { role: 'user', content: 'Can you please validate this document?' },
                { role: 'user', content: 'This is the empty page: ' + emptyPageHTML},
                { role: 'user', content: 'This is the full page: ' + fullPageHTML},
                { role: 'user', content: 'This is the user submitted page: ' + userPageHTML}
            ]
        });
        res.json({ response: response.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

