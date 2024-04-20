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
                "Is at least one of the buyer checkboxes marked? If so, that means there is a buyer listed in this document.",
                "If there is a buyer listed in this document, is their signature present and dated correctly?",
                "Is there a buyer's real estate broker firm in this document?",
                "If there is a buyer's real estate broker, is their license number present?",
                "Is there a salesperson listed in this document?",
                "If there is a salesperson listed in this document, is their license number present?",
                "If there is a salesperson listed in this document is their signature present and dated correctly?"
            ]
        },
        {
            title: 'FAIR HOUSING AND DISCRIMINATION ADVISORY',
            pageNumber: 2,
            questions: [
                "Is this page signed, name printed, and dated by at least one buyer?",
                "Is this page signed, name printed, and dated by at least one seller?"
            ]
        },
        {
            title: 'POSSIBLE REPRESENTATION OF MORE THAN ONE BUYER OR SELLER - DISCLOSURE AND CONSENT',
            pageNumber: 1,
            questions: [
                "Is this page signed, name printed, and dated by at least one buyer?",
                "Is this page signed, name printed, and dated by at least one seller?",
                "Is the Buyer's Brokerage Firm line filled in with a firm name and license number?",
                "Is the license present, page signed, name printed, and dated by the Buyer's Broker? Find this information immediately below the Buyer Brokerage line.",
                "Is the Seller's Brokerage Firm line filled in with a firm name and license number?",
                "Is the license present, page signed, name printed, and dated by the Seller's Broker? Find this information immediately below the Buyer Brokerage line."
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