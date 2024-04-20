const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    Address: String,
    MLS: String,
    PurchasePrice: String,
    ClosingDate: String,
    Seller: String,
    Buyer: String,
    Contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    }],
    TaskList: [{
        Status: String,
        Date: String,
        Description: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);


// UPDATED TRANSACTION SCHEMA
// ------------------
// Address: String
// MLS #: String
// Purchase Price: String
// Closing Date: String
// Seller: String
// Buyer: String
// Contacts: [contacts]
// Task List: [tasks]
// ------------------

// UPDATED CONTACTS SCHEMA
// ------------------
// Role: String
// Name: String
// Phone: String
// Email: String
// ------------------

// UPDATED TASKS SCHEMA
// ------------------
// Status: String
// Date: String
// Description: String
// ------------------
