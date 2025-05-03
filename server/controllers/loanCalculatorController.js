// Loan calculator controller

// Calculate monthly payment
exports.calculateMonthlyPayment = (req, res) => {
  try {
    const { loanAmount, interestRate, loanTerm } = req.body;
    
    // Validate inputs
    if (!loanAmount || !interestRate || !loanTerm) {
      return res.status(400).json({ 
        message: 'Missing required parameters: loanAmount, interestRate, loanTerm' 
      });
    }
    
    // Convert annual interest rate to monthly and decimal form
    const monthlyInterestRate = (interestRate / 100) / 12;
    
    // Convert loan term from years to months
    const loanTermMonths = loanTerm * 12;
    
    // Calculate monthly payment using the formula: P = L[i(1+i)^n]/[(1+i)^n-1]
    // Where P = monthly payment, L = loan amount, i = monthly interest rate, n = loan term in months
    const monthlyPayment = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) / 
      (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
    
    res.status(200).json({ 
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalPayment: parseFloat((monthlyPayment * loanTermMonths).toFixed(2)),
      totalInterest: parseFloat(((monthlyPayment * loanTermMonths) - loanAmount).toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating monthly payment', error: error.message });
  }
};

// Calculate amortization schedule
exports.calculateAmortizationSchedule = (req, res) => {
  try {
    const { loanAmount, interestRate, loanTerm } = req.body;
    
    // Validate inputs
    if (!loanAmount || !interestRate || !loanTerm) {
      return res.status(400).json({ 
        message: 'Missing required parameters: loanAmount, interestRate, loanTerm' 
      });
    }
    
    // Convert annual interest rate to monthly and decimal form
    const monthlyInterestRate = (interestRate / 100) / 12;
    
    // Convert loan term from years to months
    const loanTermMonths = loanTerm * 12;
    
    // Calculate monthly payment
    const monthlyPayment = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) / 
      (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
    
    // Calculate amortization schedule
    let balance = loanAmount;
    const schedule = [];
    
    for (let month = 1; month <= loanTermMonths; month++) {
      // Calculate interest for this month
      const interestPayment = balance * monthlyInterestRate;
      
      // Calculate principal for this month
      const principalPayment = monthlyPayment - interestPayment;
      
      // Update balance
      balance -= principalPayment;
      
      // Add to schedule
      schedule.push({
        month,
        payment: parseFloat(monthlyPayment.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(Math.max(0, balance).toFixed(2))
      });
    }
    
    res.status(200).json({
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalPayment: parseFloat((monthlyPayment * loanTermMonths).toFixed(2)),
      totalInterest: parseFloat(((monthlyPayment * loanTermMonths) - loanAmount).toFixed(2)),
      schedule
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating amortization schedule', error: error.message });
  }
};

// Calculate impact of prepayments
exports.calculatePrepaymentImpact = (req, res) => {
  try {
    const { loanAmount, interestRate, loanTerm, prepaymentAmount, prepaymentFrequency } = req.body;
    
    // Validate inputs
    if (!loanAmount || !interestRate || !loanTerm || !prepaymentAmount || !prepaymentFrequency) {
      return res.status(400).json({ 
        message: 'Missing required parameters: loanAmount, interestRate, loanTerm, prepaymentAmount, prepaymentFrequency' 
      });
    }
    
    // Convert annual interest rate to monthly and decimal form
    const monthlyInterestRate = (interestRate / 100) / 12;
    
    // Convert loan term from years to months
    const loanTermMonths = loanTerm * 12;
    
    // Calculate monthly payment
    const monthlyPayment = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) / 
      (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
    
    // Calculate regular amortization
    let regularBalance = loanAmount;
    let regularSchedule = [];
    
    for (let month = 1; month <= loanTermMonths; month++) {
      const interestPayment = regularBalance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      regularBalance -= principalPayment;
      
      regularSchedule.push({
        month,
        payment: parseFloat(monthlyPayment.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(Math.max(0, regularBalance).toFixed(2))
      });
    }
    
    // Calculate amortization with prepayments
    let prepaymentBalance = loanAmount;
    let prepaymentSchedule = [];
    let month = 1;
    let totalPrepaymentAmount = 0; // Track total prepayment amount
    
    // For one-time prepayment, apply it immediately after the first payment
    if (prepaymentFrequency === 'one-time') {
      // Make first regular payment
      const interestPayment = prepaymentBalance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      // Apply regular payment
      prepaymentBalance -= principalPayment;
      
      // Apply one-time prepayment
      prepaymentBalance -= prepaymentAmount;
      totalPrepaymentAmount += prepaymentAmount;
      
      // Ensure balance doesn't go below zero
      prepaymentBalance = Math.max(0, prepaymentBalance);
      
      prepaymentSchedule.push({
        month,
        payment: parseFloat(monthlyPayment.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(prepaymentBalance.toFixed(2)),
        prepayment: parseFloat(prepaymentAmount.toFixed(2))
      });
      
      month++;
    }
    
    // Continue with regular payments after any one-time prepayment
    while (prepaymentBalance > 0 && month <= loanTermMonths) {
      const interestPayment = prepaymentBalance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      // Apply regular payment
      prepaymentBalance -= principalPayment;
      
      // Apply prepayment if this is a prepayment month (excluding one-time which was handled above)
      let currentPrepayment = 0;
      if (prepaymentFrequency === 'monthly' || 
          (prepaymentFrequency === 'quarterly' && month % 3 === 0) ||
          (prepaymentFrequency === 'yearly' && month % 12 === 0)) { // Fixed 'annually' to 'yearly'
        prepaymentBalance -= prepaymentAmount;
        currentPrepayment = prepaymentAmount;
        totalPrepaymentAmount += prepaymentAmount;
      }
      
      // Ensure balance doesn't go below zero
      prepaymentBalance = Math.max(0, prepaymentBalance);
      
      prepaymentSchedule.push({
        month,
        payment: parseFloat(monthlyPayment.toFixed(2)), // Regular payment amount
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(prepaymentBalance.toFixed(2)),
        prepayment: parseFloat(currentPrepayment.toFixed(2))
      });
      
      // If balance is zero, we've paid off the loan
      if (prepaymentBalance === 0) {
        break;
      }
      
      month++;
    }
    
    // Calculate savings
    const regularTotalPayment = regularSchedule.reduce((sum, payment) => sum + payment.payment, 0);
    const regularTotalInterest = regularTotalPayment - loanAmount;
    
    // Calculate prepayment total WITHOUT including prepayment amounts in the total payment
    // This more accurately reflects the required payments, not the extra payments
    const prepaymentTotalPayment = prepaymentSchedule.reduce((sum, payment) => 
      sum + payment.payment, 0) + totalPrepaymentAmount;
    
    // Total interest is total payments (including prepayments) minus the principal
    const prepaymentTotalInterest = prepaymentTotalPayment - loanAmount;
    
    res.status(200).json({
      regularLoan: {
        loanAmount: parseFloat(loanAmount.toFixed(2)),
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        totalPayment: parseFloat(regularTotalPayment.toFixed(2)),
        totalInterest: parseFloat(regularTotalInterest.toFixed(2)),
        termMonths: loanTermMonths,
        schedule: regularSchedule // Include full regular loan schedule
      },
      withPrepayment: {
        loanAmount: parseFloat(loanAmount.toFixed(2)),
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        totalPayment: parseFloat(prepaymentTotalPayment.toFixed(2)),
        totalInterest: parseFloat(prepaymentTotalInterest.toFixed(2)),
        termMonths: prepaymentSchedule.length,
        interestSaved: parseFloat((regularTotalInterest - prepaymentTotalInterest).toFixed(2)),
        timeShortened: loanTermMonths - prepaymentSchedule.length,
        totalPrepaymentAmount: parseFloat(totalPrepaymentAmount.toFixed(2)),
        schedule: prepaymentSchedule // Include full prepayment schedule
      },
      regularSchedule: regularSchedule, // For backward compatibility
      prepaymentSchedule: prepaymentSchedule // For backward compatibility
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating prepayment impact', error: error.message });
  }
};
