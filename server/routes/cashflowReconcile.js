const express = require('express');
const cashRouter = express.Router();
const reconcileRouter = express.Router();
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/auth');

// Cash flow forecast
cashRouter.get('/forecast', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const days = parseInt(req.query.days) || 90;
    const now = new Date();
    const past90 = new Date(now - 90 * 24 * 60 * 60 * 1000);

    const transactions = await Transaction.find({
      business: businessId,
      date: { $gte: past90 }
    }).sort({ date: 1 });

    // Calculate daily averages
    const credits = transactions.filter(t => t.type === 'credit');
    const debits = transactions.filter(t => t.type === 'debit');
    const avgDailyCredit = credits.reduce((s, t) => s + t.amount, 0) / 90;
    const avgDailyDebit = debits.reduce((s, t) => s + t.amount, 0) / 90;

    // Outstanding invoices as expected inflows
    const outstanding = await Invoice.find({
      business: businessId,
      status: { $in: ['sent', 'viewed'] }
    });

    // Generate forecast
    const forecast = [];
    let runningBalance = transactions[transactions.length - 1]?.balance || 0;

    for (let i = 1; i <= days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // Check for expected payments from outstanding invoices
      const expectedInflow = outstanding
        .filter(inv => inv.dueDate && new Date(inv.dueDate) <= date)
        .reduce((s, inv) => s + inv.grandTotal, 0) / days;

      const projectedCredit = avgDailyCredit + (expectedInflow / 30);
      const projectedDebit = avgDailyDebit;
      runningBalance += projectedCredit - projectedDebit;

      forecast.push({
        date: date.toISOString().split('T')[0],
        credit: Math.round(projectedCredit),
        debit: Math.round(projectedDebit),
        balance: Math.round(runningBalance)
      });
    }

    // Monthly aggregated
    const monthly = [];
    for (let m = 0; m < 3; m++) {
      const monthSlice = forecast.slice(m * 30, (m + 1) * 30);
      const d = new Date(now);
      d.setMonth(d.getMonth() + m + 1);
      monthly.push({
        month: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        credit: monthSlice.reduce((s, f) => s + f.credit, 0),
        debit: monthSlice.reduce((s, f) => s + f.debit, 0),
        balance: monthSlice[monthSlice.length - 1]?.balance || 0
      });
    }

    res.json({ success: true, forecast, monthly, avgDailyCredit: Math.round(avgDailyCredit), avgDailyDebit: Math.round(avgDailyDebit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reconcile: upload bank transactions
reconcileRouter.post('/upload', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const { transactions } = req.body; // Array of {date, description, amount, type}

    const invoices = await Invoice.find({
      business: businessId,
      status: { $in: ['sent', 'viewed', 'overdue'] }
    });

    const results = [];
    for (const txn of transactions) {
      let matched = null;
      // Try to match by amount
      matched = invoices.find(inv =>
        Math.abs(inv.grandTotal - Math.abs(txn.amount)) < 1 ||
        inv.invoiceNumber.includes(txn.description)
      );

      const savedTxn = await Transaction.create({
        business: businessId,
        date: new Date(txn.date),
        description: txn.description,
        amount: Math.abs(txn.amount),
        type: txn.amount > 0 ? 'credit' : 'debit',
        source: 'bank_import',
        reconciled: !!matched,
        invoiceRef: matched?._id,
        bankRef: txn.ref || ''
      });

      if (matched) {
        await Invoice.findByIdAndUpdate(matched._id, { status: 'paid', paymentDate: new Date(txn.date) });
      }

      results.push({ ...savedTxn.toObject(), matchedInvoice: matched?.invoiceNumber || null });
    }

    const matchedCount = results.filter(r => r.reconciled).length;
    res.json({ success: true, results, total: results.length, matched: matchedCount, unmatched: results.length - matchedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

reconcileRouter.get('/status', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const [reconciled, unreconciled] = await Promise.all([
      Transaction.countDocuments({ business: businessId, reconciled: true }),
      Transaction.countDocuments({ business: businessId, reconciled: false })
    ]);
    res.json({ success: true, reconciled, unreconciled, total: reconciled + unreconciled });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { cashRouter, reconcileRouter };
