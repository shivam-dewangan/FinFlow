const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/auth');
const { validateGSTIN } = require('../services/gstService');

// GSTR-1 data for a month
router.get('/gstr1/:year/:month', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const { year, month } = req.params;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const invoices = await Invoice.find({
      business: businessId,
      invoiceDate: { $gte: start, $lte: end },
      status: { $ne: 'draft' }
    });

    const b2b = invoices.filter(inv => inv.customer.gstin);
    const b2c = invoices.filter(inv => !inv.customer.gstin);

    const summary = {
      totalInvoices: invoices.length,
      totalTaxableValue: invoices.reduce((s, i) => s + (i.totalTaxableAmount || 0), 0),
      totalCgst: invoices.reduce((s, i) => s + (i.totalCgst || 0), 0),
      totalSgst: invoices.reduce((s, i) => s + (i.totalSgst || 0), 0),
      totalIgst: invoices.reduce((s, i) => s + (i.totalIgst || 0), 0),
      totalTax: invoices.reduce((s, i) => s + (i.totalTax || 0), 0),
      b2bCount: b2b.length,
      b2cCount: b2c.length
    };

    res.json({ success: true, invoices, b2b, b2c, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Validate GSTIN
router.post('/validate-gstin', protect, (req, res) => {
  const { gstin } = req.body;
  const isValid = validateGSTIN(gstin);
  res.json({ success: true, valid: isValid, gstin: gstin?.toUpperCase() });
});

// GST summary by quarter
router.get('/summary', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const now = new Date();
    const quarters = [];

    for (let q = 0; q < 4; q++) {
      const qStart = new Date(now.getFullYear(), q * 3, 1);
      const qEnd = new Date(now.getFullYear(), (q + 1) * 3, 0);
      const result = await Invoice.aggregate([
        { $match: { business: businessId, invoiceDate: { $gte: qStart, $lte: qEnd }, status: { $ne: 'draft' } } },
        { $group: { _id: null, taxable: { $sum: '$totalTaxableAmount' }, tax: { $sum: '$totalTax' }, count: { $sum: 1 } } }
      ]);
      quarters.push({ quarter: `Q${q + 1}`, ...result[0] || { taxable: 0, tax: 0, count: 0 } });
    }

    res.json({ success: true, quarters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
