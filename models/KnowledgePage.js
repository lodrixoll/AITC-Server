const mongoose = require('mongoose');

const knowledgePageSchema = new mongoose.Schema({
    documentTitle: String,
    pageNumber: Number,
    emptyContent: String,
    completedContent: String,
    complianceChecklist: String,
    metaDescription: String
}, { timestamps: true });

module.exports = mongoose.model('KnowledgePage', knowledgePageSchema);

