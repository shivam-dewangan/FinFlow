const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get all businesses for user
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('businesses');
    res.json({ success: true, businesses: user.businesses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create business
router.post('/', protect, async (req, res) => {
  try {
    const { name, gstin, pan, address, phone, email, bankDetails, invoicePrefix } = req.body;
    const business = await Business.create({
      name, gstin, pan, address, phone, email, bankDetails,
      invoicePrefix: invoicePrefix || 'INV', owner: req.user._id
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { businesses: business._id },
      activeBusiness: business._id
    });
    res.status(201).json({ success: true, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single business
router.get('/:id', protect, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('members.user');
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
    res.json({ success: true, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update business
router.put('/:id', protect, async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Invite CA / member
router.post('/:id/invite', protect, async (req, res) => {
  try {
    const { email, role, permissions } = req.body;
    const business = await Business.findById(req.params.id);
    const invitedUser = await User.findOne({ email });

    const member = {
      email,
      user: invitedUser ? invitedUser._id : null,
      role: role || 'ca',
      permissions: permissions || { viewInvoices: true, viewReports: true },
      status: invitedUser ? 'active' : 'pending'
    };

    business.members.push(member);
    await business.save();

    if (invitedUser) {
      await User.findByIdAndUpdate(invitedUser._id, { $addToSet: { businesses: business._id } });
    }

    res.json({ success: true, message: `Invitation sent to ${email}`, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Remove member
router.delete('/:id/members/:memberId', protect, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    business.members = business.members.filter(m => m._id.toString() !== req.params.memberId);
    await business.save();
    res.json({ success: true, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
