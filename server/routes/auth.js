const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'finflow_secret', { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, businessName, gstin, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone });

    // Create default business
    if (businessName) {
      const business = await Business.create({
        name: businessName, gstin: gstin || '', owner: user._id,
        email, phone: phone || ''
      });
      user.businesses = [business._id];
      user.activeBusiness = business._id;
      await user.save();
    }

    const populatedUser = await User.findById(user._id).populate('activeBusiness');
    res.status(201).json({ success: true, token: generateToken(user._id), user: populatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password').populate('activeBusiness');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    user.lastLogin = Date.now();
    await user.save();
    const userData = await User.findById(user._id).populate('activeBusiness').populate('businesses');
    res.json({ success: true, token: generateToken(user._id), user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('activeBusiness').populate('businesses');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Switch active business
router.put('/switch-business/:businessId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.businesses.includes(req.params.businessId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    user.activeBusiness = req.params.businessId;
    await user.save();
    const updated = await User.findById(user._id).populate('activeBusiness').populate('businesses');
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true }).populate('activeBusiness').populate('businesses');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
