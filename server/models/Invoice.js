const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  hsn: String,
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'Nos' },
  rate: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  taxableAmount: Number,
  gstRate: { type: Number, default: 18 },
  cgst: Number,
  sgst: Number,
  igst: Number,
  totalAmount: Number
});

const invoiceSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  customer: {
    name: { type: String, required: true },
    gstin: String,
    email: String,
    phone: String,
    address: {
      line1: String, line2: String,
      city: String, state: String,
      pincode: String
    }
  },
  placeOfSupply: String,
  isInterState: { type: Boolean, default: false },
  lineItems: [lineItemSchema],
  subtotal: Number,
  totalDiscount: Number,
  totalTaxableAmount: Number,
  totalCgst: Number,
  totalSgst: Number,
  totalIgst: Number,
  totalTax: Number,
  roundOff: Number,
  grandTotal: Number,
  amountInWords: String,
  notes: String,
  terms: String,
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  pdfPath: String,
  paymentLink: String,
  paymentDate: Date,
  paymentMethod: String,
  paymentReference: String,
  remindersSent: { type: Number, default: 0 },
  lastReminderAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

invoiceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
