const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appRoutes = require('./routes/api'); // Import the routes
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
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', appRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});