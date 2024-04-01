const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OpenAI = require('openai');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Check if uploads directory exists, if not, create it
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Multer upload
const upload = multer({ storage: storage });

// Upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        // File is automatically saved to 'uploads/' directory with multer
        // You can perform any database operation here if needed
        res.status(201).json({ message: "File uploaded successfully", filePath: req.file.path });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

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
        // Generate a token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }); // Find user by email
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Compare the password
        if (await bcrypt.compare(password, user.password)) {
            // Generate a token
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ message: "Login successful", token });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;