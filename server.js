const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users'); 
const uploadRoutes = require('./routes/upload');
const documentRoutes = require('./routes/document');
const contactRoutes = require('./routes/contact');

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
app.use('/api/document', documentRoutes);
app.use('/api/contact', contactRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});