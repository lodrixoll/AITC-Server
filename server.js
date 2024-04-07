const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users'); 
const uploadRoutes = require('./routes/upload'); 
const chatRoutes = require('./routes/chat'); 
const ragRoutes = require('./routes/rag');
const transactionsRoutes = require('./routes/transactions');
const upstageRoutes = require('./routes/upstage');
const knowledgeRoutes = require('./routes/knowledge');

require('dotenv').config();

// create express app
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
    process.exit(1);
  });

// Middlewares
app.use(cors());
app.use(express.json());

// Use the routers
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/upstage', upstageRoutes);
app.use('/api/knowledge', knowledgeRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});