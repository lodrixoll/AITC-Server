const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

// Check if uploads directory exists, if not, create it
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir); // Use the uploads directory
    },
    filename: function(req, file, cb) {
        // Generate a unique filename
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Upload endpoint
router.post('/', upload.single('file'), (req, res) => {
    try {
        // File is automatically saved to the specified directory with multer
        // You can perform any additional database operation here if needed
        res.status(201).json({ message: "File uploaded successfully", filePath: req.file.path });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;