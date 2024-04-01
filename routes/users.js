const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// Register endpoint
router.post('/register', async (req, res) => {
    console.log("\n\n==== New user registration ====")
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
        console.log("User created successfully")
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log("Error creating user")
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    console.log("\n\n==== User login ====")
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
            console.log("Login successful")
        } else {
            res.status(401).json({ message: "Invalid credentials" });
            console.log("Invalid credentials")
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log("Error logging in")
    }
});

module.exports = router;