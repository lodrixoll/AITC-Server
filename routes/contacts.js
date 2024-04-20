const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Get all contacts
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single contact by id
router.get('/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json(contact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new contact
router.post('/', async (req, res) => {
    const contact = new Contact({
        name: req.body.name,
        role: req.body.role,
        phone: req.body.phone,
        email: req.body.email,
    });

    try {
        const newContact = await contact.save();
        res.status(201).json(newContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a contact
router.delete('/:id', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json({ message: 'Deleted Contact' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search for a contact by any field
router.get('/search', async (req, res) => {
    try {
        const query = {};
        for (const key in req.query) {
            query[key] = { $regex: req.query[key], $options: 'i' };
        }
        const contacts = await Contact.find(query);
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Seed the database with contacts
router.post('/seed', async (req, res) => {
    try {
        await Contact.deleteMany({});
        const seedContacts = [
            {
                name: "Ryan Valdes",
                role: "Buyer Broker",
                phone: "425-505-8181",
                email: "ryanvaldes@windermere.com",
                company: "Windermere"
            },
            {
                name: "Aimee Cruz",
                role: "Transaction Coordinator",
                phone: "425-643-5500",
                email: "windermereTS@windermere.com",
                company: "Windermere TS"
            },
            {
                name: "Cheryl Crane",
                role: "Listing Broker",
                phone: "206-930-2551",
                email: "ccrane@windermere.com",
                company: "Windermere"
            },
            {
                name: "Angela Hinton",
                role: "Escrow",
                phone: "253-813-9394",
                email: "teamhinton@ortc.com",
                company: "Old Republic Title"
            },
            {
                name: "Residential Title Unit",
                role: "Title",
                phone: "425-776-3350",
                email: "title.wa@ortc.com",
                company: "Old Republic Title",
            },
            {
                name: "Ashley McPoland",
                role: "Lender",
                phone: "(480)206-7129",
                email: "amcpoland@westcapitallending.com",
                company: "West Capital Lending"
            },
            {
                name: "Kelkari",
                role: "HOA",
                phone: "425-897-3400",
                email: "",
                company: ""
            }
        ];
        await Contact.insertMany(seedContacts);
        res.status(201).json({ message: 'Database seeded successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;