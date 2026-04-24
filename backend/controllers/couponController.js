const Coupon = require('../models/Coupon');
const Booking = require('../models/Booking');

exports.validateCoupon = async (req, res) => {
  try {
    const { code, tripId, userId, amount } = req.body;
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });
    
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon' });
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit exceeded' });
    }
    
    if (coupon.minPurchase && amount < coupon.minPurchase) {
      return res.status(400).json({ error: `Minimum purchase of ₹${coupon.minPurchase} required` });
    }
    
    if (coupon.applicableTrips.length > 0 && !coupon.applicableTrips.includes(tripId)) {
      return res.status(400).json({ error: 'Coupon not applicable for this trip' });
    }
    
    if (coupon.applicableUsers.length > 0 && !coupon.applicableUsers.includes(userId)) {
      return res.status(400).json({ error: 'Coupon not applicable for this user' });
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, amount);
    }
    
    res.json({
      valid: true,
      discount,
      finalAmount: amount - discount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    res.json(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};