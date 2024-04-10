const mongoose = require('mongoose');

const userPageSchema = new mongoose.Schema({
    documentTitle: String,
    pageNumber: Number,
    content: String,
    compliance: Boolean,
    reasoning: String,
    instructions: String,
    metaDescription: String
}, { timestamps: true });

module.exports = mongoose.model('userPage', userPageSchema);

