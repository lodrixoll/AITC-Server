const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    address: String,
    Seller: String,
    "Listing Agent": String,
    "Listing Broker": String,
    Buyer: String,
    "Buyer's Agent": String,
    "Buyer's Broker": String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);