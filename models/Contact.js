const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    role: String,
    name: String,
    phone: String,
    email: String,
    company: String,

}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);

