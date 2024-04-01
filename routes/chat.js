const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

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

module.exports = router;