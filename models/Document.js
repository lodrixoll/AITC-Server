const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    pageNumber: Number,
    html: String,
    stylesheet: String,
});

const documentSchema = new mongoose.Schema({
    type: String, // temporary
    documentTitle: String,
    totalPages: Number,
    pages: [pageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);