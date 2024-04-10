const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    documentTitle: String,
    pageNumber: Number,
    emptyContent: String,
    completedContent: String,
    complianceChecklist: String,
    metaDescription: String
}, { timestamps: true });

module.exports = mongoose.model('Knowledge', knowledgeSchema);

