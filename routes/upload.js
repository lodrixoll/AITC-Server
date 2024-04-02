const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Import UUID to generate unique IDs

require('dotenv').config();

// Check if uploads directory exists, if not, create it
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Uploads directory created")
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir); // Use the uploads directory
    },
    filename: function(req, file, cb) {
        // Generate a unique filename using UUID
        const uniqueId = uuidv4();
        const filename = uniqueId + path.extname(file.originalname);
        cb(null, filename);
        req.fileUniqueId = uniqueId; // Attach the uniqueId to the request object
    }
});
console.log("Multer storage configured")

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });
console.log("Multer initialized")

// Upload endpoint
router.post('/', upload.single('file'), (req, res) => {
    console.log("\n\n==== Uploading File ====")
    try {
        // Return the unique ID in the response
        res.status(201).json({ message: "File uploaded successfully", uniqueId: req.fileUniqueId, filePath: req.file.path });
        console.log("File uploaded successfully")
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log("Error uploading file")
    }
});

module.exports = router;