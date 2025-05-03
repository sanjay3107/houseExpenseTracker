const mongoose = require('mongoose');

const HouseDetailsSchema = new mongoose.Schema({
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  purchaseDetails: {
    purchaseDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    downPayment: { type: Number, required: true },
    closingCosts: { type: Number, default: 0 }
  },
  propertyDetails: {
    squareFeet: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    yearBuilt: { type: Number },
    lotSize: { type: String },
    propertyType: { 
      type: String, 
      enum: ['Single Family', 'Townhouse', 'Condo', 'Multi-Family', 'Other'] 
    }
  },
  loanDetails: {
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    loanTerm: { type: Number, required: true }, // in years
    monthlyPayment: { type: Number, required: true },
    loanStartDate: { type: Date, required: true },
    lender: { type: String },
    loanType: { 
      type: String, 
      enum: ['Fixed Rate', 'Adjustable Rate', 'FHA', 'VA', 'USDA', 'Other'] 
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HouseDetails', HouseDetailsSchema);
