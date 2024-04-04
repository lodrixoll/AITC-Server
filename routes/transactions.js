const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Endpoint to create a new transaction
router.post('/', async (req, res) => {
    console.log("\n\n==== New Transaction ====")
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
    console.log("\n\n==== Get all Transactions ====")
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to seed the database with predefined transactions
router.post('/seed', async (req, res) => {
    console.log("\n\n==== Seed Transactions ====")
    const seedData = [
        { address: "123 Maple Street", Seller: "Alex Johnson", "Listing Agent": "Samantha Right", "Listing Broker": "Keller Williams Realty", Buyer: "Jordan Smith", "Buyer's Agent": "Michael Brown", "Buyer's Broker": "Coldwell Banker" },
        { address: "456 Oak Avenue", Seller: "Emily Turner", "Listing Agent": "Lucas Graham", "Listing Broker": "Century 21", Buyer: "Olivia King", "Buyer's Agent": "Sophia Carter", "Buyer's Broker": "RE/MAX" },
        { address: "789 Pine Road", Seller: "William Davis", "Listing Agent": "Emma Wilson", "Listing Broker": "Berkshire Hathaway", Buyer: "Mason Miller", "Buyer's Agent": "Isabella Garcia", "Buyer's Broker": "Sotheby's International Realty" },
        { address: "1011 Birch Lane", Seller: "Ava Moore", "Listing Agent": "Ethan Taylor", "Listing Broker": "Redfin", Buyer: "Isabella Garcia", "Buyer's Agent": "Noah Anderson", "Buyer's Broker": "Compass" },
        { address: "1213 Cedar Court", Seller: "Sophia Carter", "Listing Agent": "Oliver Martinez", "Listing Broker": "eXp Realty", Buyer: "Mia Hernandez", "Buyer's Agent": "Charlotte Gonzalez", "Buyer's Broker": "The Agency" }
    ];

    try {
        await Transaction.deleteMany(); // Optional: Clears the existing transactions before seeding
        await Transaction.insertMany(seedData);
        res.status(201).json({ message: "Transactions database seeded successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to delete a transaction by id
router.delete('/:id', async (req, res) => {
    console.log("\n\n==== Delete Transaction by ID ====")
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        console.log(`Transaction with id ${transaction.id} was deleted`);
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;