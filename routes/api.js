const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OpenAI = require('openai');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI(process.env.OPENAI_API_KEY);

router.post('/chat', async (req, res) => {
    const { message } = req.body;
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'Hello! How can I help you today?' }, { role: 'user', content: message }]
    });
    res.json(response.choices[0].message.content);
});

router.get('/', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Completed Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }); // Find user by email
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Compare the password
        if (await bcrypt.compare(password, user.password)) {
            res.json({ message: "Login successful" });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;