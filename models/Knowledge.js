const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    FileName: String,
    PageNumber: Number,
    Content: String,
}, { timestamps: true });

module.exports = mongoose.model('Knowledge', knowledgeSchema);

