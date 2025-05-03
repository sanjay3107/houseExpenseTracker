const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Purchase', 'Renovation', 'Maintenance', 'Tax', 'Insurance', 'Utility', 'Other']
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Other']
  },
  receipt: {
    type: String // URL to receipt image if uploaded
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', ExpenseSchema);
