const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  category: {
    type: String,
    enum: ['sales', 'purchase', 'expense', 'salary', 'tax', 'loan', 'other'],
    default: 'other'
  },
  invoiceRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  reconciled: { type: Boolean, default: false },
  reconciledAt: Date,
  source: { type: String, enum: ['manual', 'bank_import', 'invoice', 'razorpay'], default: 'manual' },
  bankRef: String,
  balance: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
