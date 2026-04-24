const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['booking', 'operator_payment', 'hotel_payment', 'vendor_payment', 'refund', 'salary', 'maintenance', 'marketing', 'other'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Booking', 'Payment', 'Vendor', 'User']
  },
  description: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'bank_transfer', 'cash', 'cheque'],
    default: 'razorpay'
  },
  transactionId: String,
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  invoiceNumber: String,
  invoiceUrl: String,
  receiptNumber: String,
  receiptUrl: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for financial reports
financeSchema.index({ date: -1, type: 1, category: 1 });
financeSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Finance', financeSchema);