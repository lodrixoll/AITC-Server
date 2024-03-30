const express = require('express');
const mongoose = require('mongoose');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected...');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error("exiting app");
    process.exit(1); // Stop the app if the DB connection fails
  });

// Initialize OpenAI
const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: 'Hello! How can I help you today?' }, { role: 'user', content: message }]
  });
  res.json(response.choices[0].message.content);
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
