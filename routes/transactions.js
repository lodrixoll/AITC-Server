const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Contact = require('../models/Contact');

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
// Endpoint to seed the database with predefined transactions
router.post('/seed', async (req, res) => {
    console.log("\n\n==== Seed Transactions ====")
    try {
        await Transaction.deleteMany(); // Clears the existing transactions
        await Contact.deleteMany(); // Clears existing contacts

        // Seed contacts first
        const seedContacts = [
            { name: "Ryan Valdes", role: "Buyer Broker", phone: "425-505-8181", email: "ryanvaldes@windermere.com", company: "Windermere" },
            { name: "Aimee Cruz", role: "Transaction Coordinator", phone: "425-643-5500", email: "windermereTS@windermere.com", company: "Windermere TS" },
            { name: "Cheryl Crane", role: "Listing Broker", phone: "206-930-2551", email: "ccrane@windermere.com", company: "Windermere" },
            { name: "Angela Hinton", role: "Escrow", phone: "253-813-9394", email: "teamhinton@ortc.com", company: "Old Republic Title" },
            { name: "Residential Title Unit", role: "Title", phone: "425-776-3350", email: "title.wa@ortc.com", company: "Old Republic Title" },
            { name: "Ashley McPoland", role: "Lender", phone: "(480)206-7129", email: "amcpoland@westcapitallending.com", company: "West Capital Lending" },
            { name: "Kelkari", role: "HOA", phone: "425-897-3400", email: "", company: "" }
        ];
        const contacts = await Contact.insertMany(seedContacts);

        // Seed transactions with contact IDs
        const seedData = [
            { Address: "123 Maple Street", PurchasePrice: "$100,000", Seller: "Alex Johnson", Buyer: "Jordan Smith", Contacts: contacts.map(contact => contact._id) },
            { Address: "456 Oak Avenue", PurchasePrice: "$200,000", Seller: "Emily Turner", Buyer: "Olivia King", Contacts: contacts.map(contact => contact._id) },
            { Address: "789 Pine Road", PurchasePrice: "$300,000", Seller: "William Davis", Buyer: "Mason Miller", Contacts: contacts.map(contact => contact._id) },
            { Address: "1011 Birch Lane", PurchasePrice: "$400,000", Seller: "Ava Moore", Buyer: "Isabella Garcia", Contacts: contacts.map(contact => contact._id) },
            { Address: "1213 Cedar Court", PurchasePrice: "$500,000", Seller: "Sophia Carter", Buyer: "Mia Hernandez", Contacts: contacts.map(contact => contact._id) }
        ];
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