const mongoose = require('mongoose');

// Define a schema for questions
const questionSchema = new mongoose.Schema({
    title: String,
    pageNumber: Number,
    questions: [String]
});

// Create a model from the schema
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
