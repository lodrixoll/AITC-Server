const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    pageNumber: Number,
    html: String,
});

const documentSchema = new mongoose.Schema({
    type: String, // either validation or user
    documentTitle: String,
    totalPages: Number,
    pages: [pageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);