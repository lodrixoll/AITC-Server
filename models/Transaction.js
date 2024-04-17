const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    address: String,
    MLS: String,
    price: String,
    buyer: String,
    closingDate: String,

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

