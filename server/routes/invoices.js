const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Business = require('../models/Business');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const { calculateGST, numberToWords } = require('../services/gstService');
const { generateInvoicePDF } = require('../services/pdfService');

// Get all invoices
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    if (!businessId) return res.status(400).json({ success: false, message: 'No active business' });

    const query = { business: businessId };
    if (status && status !== 'all') query.status = status;
    if (search) query['customer.name'] = { $regex: search, $options: 'i' };

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, invoices, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create invoice
router.post('/', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

    const { customer, lineItems, invoiceDate, dueDate, notes, terms, placeOfSupply } = req.body;
    const isInterState = placeOfSupply && business.address?.state && placeOfSupply !== business.address.state;

    const gstCalc = calculateGST(lineItems, isInterState);
    const invoiceNumber = `${business.invoicePrefix}/${String(business.invoiceCounter).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      business: businessId,
      invoiceNumber,
      invoiceDate: invoiceDate || Date.now(),
      dueDate,
      customer,
      placeOfSupply,
      isInterState,
      notes,
      terms,
      createdBy: req.user._id,
      amountInWords: numberToWords(gstCalc.grandTotal),
      ...gstCalc
    });

    // Increment counter
    business.invoiceCounter += 1;
    await business.save();

    // Generate PDF
    try {
      const { filePath, fileName } = await generateInvoicePDF(invoice, business);
      invoice.pdfPath = `/pdfs/${fileName}`;
      await invoice.save();
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
    }

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single invoice
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update invoice status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, paymentDate, paymentMethod, paymentReference } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, {
      status, paymentDate, paymentMethod, paymentReference
    }, { new: true });

    // Create transaction if paid
    if (status === 'paid') {
      await Transaction.create({
        business: invoice.business,
        date: paymentDate || Date.now(),
        description: `Payment received - ${invoice.invoiceNumber}`,
        amount: invoice.grandTotal,
        type: 'credit',
        category: 'sales',
        invoiceRef: invoice._id,
        source: 'invoice',
        reconciled: true
      });
    }

    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send invoice via email
router.post('/:id/send', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    invoice.status = 'sent';
    await invoice.save();
    // Email sending would go here with nodemailer
    res.json({ success: true, message: 'Invoice sent successfully', invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dashboard stats
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 3, 1); // April start

    const [total, paid, outstanding, overdue, monthRevenue, recentInvoices] = await Promise.all([
      Invoice.countDocuments({ business: businessId }),
      Invoice.aggregate([{ $match: { business: businessId, status: 'paid' } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      Invoice.aggregate([{ $match: { business: businessId, status: { $in: ['sent', 'viewed'] } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      Invoice.countDocuments({ business: businessId, status: 'overdue' }),
      Invoice.aggregate([{ $match: { business: businessId, status: 'paid', paymentDate: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      Invoice.find({ business: businessId }).sort({ createdAt: -1 }).limit(5)
    ]);

    // Monthly revenue for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const result = await Invoice.aggregate([
        { $match: { business: businessId, status: 'paid', paymentDate: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]);
      monthlyData.push({
        month: start.toLocaleString('en-IN', { month: 'short' }),
        revenue: result[0]?.total || 0
      });
    }

    res.json({
      success: true,
      stats: {
        totalInvoices: total,
        totalRevenue: paid[0]?.total || 0,
        outstandingAmount: outstanding[0]?.total || 0,
        overdueCount: overdue,
        monthRevenue: monthRevenue[0]?.total || 0,
        monthlyChart: monthlyData,
        recentInvoices
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
