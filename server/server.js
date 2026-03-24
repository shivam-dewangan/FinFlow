const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for generated PDFs
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/gst', require('./routes/gst'));
app.use('/api/cashflow', require('./routes/cashflow'));
app.use('/api/reconcile', require('./routes/reconcile'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'FinFlow API running' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

// Connect DB and start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finflow')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 FinFlow server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
