const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const { type, category, page = 1, limit = 30 } = req.query;
    const query = { business: businessId };
    if (type) query.type = type;
    if (category) query.category = category;
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 }).skip((page - 1) * limit).limit(parseInt(limit))
      .populate('invoiceRef', 'invoiceNumber grandTotal');
    res.json({ success: true, transactions, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const businessId = req.user.activeBusiness?._id || req.user.activeBusiness;
    const transaction = await Transaction.create({ ...req.body, business: businessId });
    res.status(201).json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
