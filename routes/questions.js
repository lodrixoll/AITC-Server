const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

router.post('/seed', async (req, res) => {
    console.log("\n\n==== Seeding Questions ====");

    const questions = [
        {
            title: 'DISCLOSURE REGARDING REAL ESTATE AGENCY RELATIONSHIP',
            pageNumber: 1,
            questions: [
                "Is there at least one buyer with a corresponding printed name, and date?",
                "Is the Real Estate Broker (Firm) & license present in this document?",
                "Is there a Salesperson listed with a corresponding printed name, license #, and date?"
            ]
        },
        {
            title: 'FAIR HOUSING AND DISCRIMINATION ADVISORY',
            pageNumber: 2,
            questions: [
                "Does this page contain at least one buyer with a printed name and date?",
                "Does this page contain at least one seller with a printed name and date?"
            ]
        },
        {
            title: 'POSSIBLE REPRESENTATION OF MORE THAN ONE BUYER OR SELLER - DISCLOSURE AND CONSENT',
            pageNumber: 1,
            questions: [
                "Does this page contain at least one buyer with a printed name and date?",
                "Does this page contain at least one seller with a printed name and date?",
                "Does this page contain the Buyers Brokerage Firm & License #?",
                "Does this page container the Buyer Real Estate Agent with a printed name, License #, and date?",
                "Does this page contain the Sellers Brokerage Firm & License #?",
                "Does this page container the Seller Real Estate Agent with a printed name, License #, and date?"
            ]
        },
        {
            title: 'WIRE FRAUD AND TRANSFER ELECTRONIC FUNDS TRANSFER ADVISORY',
            pageNumber: 1,
            questions: [
                "Is this page signed, name printed, and dated by at least one buyer?",
                "Is this page signed, name printed, and dated by at least one seller?"
            ]
        },
        {
            title: 'BUYER HOMEOWNERS INSURANCE ADVISORY',
            pageNumber: 1,
            questions: [
                "Is this page signed, name printed, and dated by at least one buyer?"
            ]
        },
        {
            title: "BUYER'S INVESTIGATION ADVISORY",
            pageNumber: 1,
            questions: [
                "Is there a valid property address present at the top of the document?"
            ]
        },
        {
            title: "BUYER'S INVESTIGATION ADVISORY",
            pageNumber: 2,
            questions: [
                "Is this page signed, name printed, and dated by at least one buyer?"
            ]
        },
        {
            title: 'FAIR APPRAISAL ACT ADDENDUM',
            pageNumber: 1,
            questions: [
                "Is there a date present at the top of the file?",
                "Is the property address present at the top of the file?",
                "Is the seller listed at the top of the file?",
                "Is the buyer listed at the top of the file?",
                "Is this page signed, name printed, and dated by at least one buyer?",
                "Is this page signed, name printed, and dated by at least one seller?"
            ]
        },
        {
            title: 'CALIFORNIA CONSUMER PRIVACY ACT ADVISORY, DISCLOSURE AND NOTICE',
            pageNumber: 1,
            questions: [
                "Is this page signed, name printed, and dated by at least one buyer?"
            ]
        }
    ];

    try {
        // Delete existing questions
        await Question.deleteMany({});

        // Insert new questions
        for (const question of questions) {
            const questionDoc = new Question(question);
            await questionDoc.save();
        }

        console.log("Questions seeded successfully.");
        res.status(200).json({ message: 'Questions seeded successfully' });
    } catch (error) {
        console.error('Error seeding questions:', error);
        res.status(500).send('Error seeding questions');
    }
});

module.exports = router;