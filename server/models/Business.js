const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String },
  role: { type: String, enum: ['owner', 'ca', 'staff'], default: 'staff' },
  permissions: {
    viewInvoices: { type: Boolean, default: true },
    createInvoices: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: true },
    manageSettings: { type: Boolean, default: false }
  },
  invitedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'active'], default: 'active' }
});

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  gstin: { type: String, trim: true, uppercase: true },
  pan: { type: String, trim: true, uppercase: true },
  address: {
    line1: String, line2: String,
    city: String, state: String,
    pincode: String, country: { type: String, default: 'India' }
  },
  phone: String,
  email: String,
  logo: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  bankDetails: {
    bankName: String, accountNo: String,
    ifsc: String, branch: String, upiId: String
  },
  invoicePrefix: { type: String, default: 'INV' },
  invoiceCounter: { type: Number, default: 1 },
  gstRegistrationType: {
    type: String,
    enum: ['regular', 'composition', 'unregistered'],
    default: 'regular'
  },
  defaultGstRate: { type: Number, default: 18 },
  financialYearStart: { type: String, default: 'April' },
  plan: { type: String, enum: ['free', 'growth', 'pro'], default: 'free' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', businessSchema);
