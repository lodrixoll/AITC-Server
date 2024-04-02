const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Endpoint to create a new transaction
router.post('/', async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint to get all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to seed the database with predefined transactions
router.post('/seed', async (req, res) => {
    const seedData = [
        { id: 1, address: "123 Maple Street", Seller: "Alex Johnson", "Listing Agent": "Samantha Right", "Listing Broker": "Keller Williams Realty", Buyer: "Jordan Smith", "Buyer's Agent": "Michael Brown", "Buyer's Broker": "Coldwell Banker" },
        { id: 2, address: "456 Oak Avenue", Seller: "Emily Turner", "Listing Agent": "Lucas Graham", "Listing Broker": "Century 21", Buyer: "Olivia King", "Buyer's Agent": "Sophia Carter", "Buyer's Broker": "RE/MAX" },
        { id: 3, address: "789 Pine Road", Seller: "William Davis", "Listing Agent": "Emma Wilson", "Listing Broker": "Berkshire Hathaway", Buyer: "Mason Miller", "Buyer's Agent": "Isabella Garcia", "Buyer's Broker": "Sotheby's International Realty" },
        { id: 4, address: "1011 Birch Lane", Seller: "Ava Moore", "Listing Agent": "Ethan Taylor", "Listing Broker": "Redfin", Buyer: "Isabella Garcia", "Buyer's Agent": "Noah Anderson", "Buyer's Broker": "Compass" },
        { id: 5, address: "1213 Cedar Court", Seller: "Sophia Carter", "Listing Agent": "Oliver Martinez", "Listing Broker": "eXp Realty", Buyer: "Mia Hernandez", "Buyer's Agent": "Charlotte Gonzalez", "Buyer's Broker": "The Agency" }
    ];

    try {
        await Transaction.deleteMany(); // Optional: Clears the existing transactions before seeding
        await Transaction.insertMany(seedData);
        res.status(201).json({ message: "Database seeded with transactions successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;