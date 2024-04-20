const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    address: String,
    price: String,
    Seller: String,
    "Listing Agent": String,
    "Listing Broker": String,
    Buyer: String,
    "Buyer's Agent": String,
    "Buyer's Broker": String
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
