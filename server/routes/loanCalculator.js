const express = require('express');
const router = express.Router();
const loanCalculatorController = require('../controllers/loanCalculatorController');
const auth = require('../middleware/auth'); // Import auth middleware

// All routes require authentication
router.use(auth);

// POST calculate monthly payment
router.post('/monthly-payment', loanCalculatorController.calculateMonthlyPayment);

// POST calculate amortization schedule
router.post('/amortization-schedule', loanCalculatorController.calculateAmortizationSchedule);

// POST calculate prepayment impact
router.post('/prepayment-impact', loanCalculatorController.calculatePrepaymentImpact);

module.exports = router;
