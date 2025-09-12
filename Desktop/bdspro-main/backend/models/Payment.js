const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  amount: {
    type: Number,
    required: true,
    min: 50
  },
  network: {
    type: String,
    required: true,
    enum: ['TRC20', 'BEP20']
  },
  screenshotURL: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'rejected'],
    default: 'pending'
  },
  txHash: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ email: 1 });

module.exports = mongoose.model('Payment', paymentSchema);