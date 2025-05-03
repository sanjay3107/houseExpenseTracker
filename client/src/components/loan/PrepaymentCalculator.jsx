import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, ProgressBar, Pagination, Table, Alert } from 'react-bootstrap';
import { formatIndianCurrency, parseIndianAmount } from '../../utils/currencyFormatter';
import API_ENDPOINTS from '../../config/api';
import '../../styles/calculator.css';

const PrepaymentCalculator = () => {
  const [loanDetails, setLoanDetails] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '',
    prepaymentAmount: '',
    prepaymentFrequency: 'monthly'
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [houseDetails, setHouseDetails] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearDetails, setYearDetails] = useState(null);
  const [useExistingLoan, setUseExistingLoan] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 12; // Show 1 year of payments per page

  useEffect(() => {
    const fetchHouseDetails = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.HOUSE.DETAILS);
        
        if (response.data && response.data.loan_details) {
          setHouseDetails(response.data);
          
          // Auto-populate fields if loan details exist
          if (response.data.loan_details.loan_amount && 
              response.data.loan_details.interest_rate && 
              response.data.loan_details.loan_term) {
            setLoanDetails(prev => ({
              ...prev,
              loanAmount: response.data.loan_details.loan_amount,
              interestRate: response.data.loan_details.interest_rate,
              loanTerm: response.data.loan_details.loan_term
            }));
            setUseExistingLoan(true);
          }
        }
      } catch (err) {
        // It's okay if we can't fetch house details
        console.log('No house details found');
      }
    };
    
    fetchHouseDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Handle different input types appropriately
    if (name === 'loanAmount' || name === 'prepaymentAmount') {
      // Convert lakh/crore notation to absolute numbers
      parsedValue = parseIndianAmount(value);
    } else if (name === 'loanTerm') {
      // Ensure loan term ONLY accepts digits and preserve the exact input value
      // Filter out any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      parsedValue = numericValue;
      
      // Log the exact string we're storing to help debug
      console.log('Loan term input:', value, '→ storing as:', parsedValue);
    } else if (name === 'interestRate') {
      // Allow only valid decimal input for interest rate
      const regex = /^\d*\.?\d*$/;
      if (value === '' || regex.test(value)) {
        parsedValue = value;
      } else {
        // If input is invalid, keep the previous value
        return;
      }
    }
    
    // Update state with the processed value
    setLoanDetails(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleUseExistingLoan = () => {
    if (houseDetails && houseDetails.loan_details) {
      setLoanDetails(prev => ({
        ...prev,
        loanAmount: houseDetails.loan_details.loan_amount,
        interestRate: houseDetails.loan_details.interest_rate,
        loanTerm: houseDetails.loan_details.loan_term
      }));
      setUseExistingLoan(true);
      
      // Automatically calculate when using existing loan details
      setTimeout(() => {
        document.getElementById('calculate-prepayment-btn').click();
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form data
      if (!loanDetails.loanAmount || !loanDetails.interestRate || !loanDetails.loanTerm ||
          !loanDetails.prepaymentAmount || !loanDetails.prepaymentFrequency) {
        setError('Please enter valid values for all fields.');
        setLoading(false);
        return;
      }
      
      // Calculate prepayment impact
      const response = await axios.post(
        API_ENDPOINTS.LOAN.PREPAYMENT,
        {
          loanAmount: parseFloat(loanDetails.loanAmount),
          interestRate: parseFloat(loanDetails.interestRate),
          loanTerm: parseInt(loanDetails.loanTerm, 10), // Use parseInt instead of parseFloat for loan term
          prepaymentAmount: parseFloat(loanDetails.prepaymentAmount),
          prepaymentFrequency: loanDetails.prepaymentFrequency
        }
      );
      
      const data = response.data;
      
      setResults(data);
      setLoading(false);
    } catch (err) {
      setError('Error calculating prepayment impact. Please try again.');
      console.error('Prepayment calculation error:', err);
      setLoading(false);
    }
  };

  // Helper functions for the timeline visualization
  const formatLoanTerm = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} years${remainingMonths > 0 ? `, ${remainingMonths} months` : ''}`;
  };

  // Get remaining principal at a specific year
  const getRemainingPrincipal = (scheduleData, year) => {
    if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
      console.log('Invalid schedule data for remaining principal calculation');
      return 0;
    }
    
    // Calculate the month number for the end of the specified year
    const targetMonth = year * 12;
    
    // Find the payment entry closest to the target month without exceeding it
    let closestIndex = 0;
    for (let i = 0; i < scheduleData.length; i++) {
      if (scheduleData[i].month <= targetMonth) {
        closestIndex = i;
      } else {
        break;
      }
    }
    
    // Return the remaining balance at that point
    const remainingPrincipal = scheduleData[closestIndex]?.balance || 0;
    console.log(`Year ${year}, remaining principal:`, remainingPrincipal);
    return remainingPrincipal;
  };
  
  // Get total interest paid up to a specific year
  const getInterestPaidSoFar = (scheduleData, year) => {
    if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
      console.log('Invalid schedule data for interest calculation');
      return 0;
    }
    
    // Calculate the month number for the end of the specified year
    const targetMonth = year * 12;
    
    // Sum up all interest payments up to the target month
    let totalInterest = 0;
    for (let i = 0; i < scheduleData.length && scheduleData[i].month <= targetMonth; i++) {
      totalInterest += scheduleData[i].interest;
    }
    
    console.log(`Year ${year}, total interest paid:`, totalInterest);
    return totalInterest;
  };
  
  // Get total prepayments made up to a specific year
  const getPrepaymentsMade = (scheduleData, year) => {
    // Validate input
    if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
      console.log('Invalid schedule data for prepayment calculation');
      return 0;
    }
    
    // Calculate the month number for the end of the specified year
    const targetMonth = year * 12;
    
    // Sum up all prepayments up to the target month
    let totalPrepayments = 0;
    for (let i = 0; i < scheduleData.length && scheduleData[i].month <= targetMonth; i++) {
      // Try different property names that might be used for prepayment
      const prepaymentAmount = scheduleData[i].prepayment || scheduleData[i].extraPayment || 0;
      totalPrepayments += prepaymentAmount;
    }
    
    console.log(`Year ${year}, total prepayments:`, totalPrepayments);
    return totalPrepayments;
  };

  // Handle year selection in the timeline
  const handleYearClick = (year) => {
    setSelectedYear(year);
    
    if (results && results.regularLoan && results.withPrepayment) {
      // Get data for the selected year
      const regularRemainingPrincipal = getRemainingPrincipal(results.regularLoan.schedule, year);
      const prepaymentRemainingPrincipal = getRemainingPrincipal(results.withPrepayment.schedule, year);
      const regularInterestPaid = getInterestPaidSoFar(results.regularLoan.schedule, year);
      const prepaymentInterestPaid = getInterestPaidSoFar(results.withPrepayment.schedule, year);
      const prepaymentsMade = getPrepaymentsMade(results.withPrepayment.schedule, year);
      
      // Set the year details
      setYearDetails({
        regular: {
          remainingPrincipal: regularRemainingPrincipal,
          interestPaid: regularInterestPaid,
        },
        withPrepayment: {
          remainingPrincipal: prepaymentRemainingPrincipal,
          interestPaid: prepaymentInterestPaid,
          prepaymentsMade: prepaymentsMade,
        },
      });
    }
  };

  return (
    <div className="prepayment-calculator-container">
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h1 className="mb-0"><i className="bi bi-graph-down-arrow text-primary me-2"></i>Prepayment Calculator</h1>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="g-4 mb-4">
        <Col lg={4} md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white py-3 fw-bold">
              <i className="bi bi-bank me-2"></i>Loan Details
            </Card.Header>
            <Card.Body className="p-4">
              {houseDetails && houseDetails.loanDetails && !useExistingLoan && (
                <Alert variant="info" className="mb-3">
                  You have existing loan details in your house profile.
                  <Button 
                    variant="link" 
                    className="p-0 ms-2" 
                    onClick={handleUseExistingLoan}
                  >
                    Use these details
                  </Button>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Loan Amount (₹)</Form.Label>
                  <Form.Text className="text-muted d-block mb-1">
                    You can enter values like "60L" or "1.5Cr"
                  </Form.Text>
                  <Form.Control
                    type="text"
                    name="loanAmount"
                    value={loanDetails.loanAmount}
                    onChange={handleInputChange}
                    placeholder="e.g., 60L or 1.5Cr"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Interest Rate (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="interestRate"
                    value={loanDetails.interestRate}
                    onChange={handleInputChange}
                    placeholder="e.g., 4.5"
                    min="0.1"
                    step="0.01"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Loan Term (years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="loanTerm"
                    value={loanDetails.loanTerm}
                    onChange={handleInputChange}
                    placeholder="e.g., 20"
                    min="1"
                    max="30"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Prepayment Amount (₹)</Form.Label>
                  <Form.Text className="text-muted d-block mb-1">
                    You can enter values like "50K" or "1L"
                  </Form.Text>
                  <Form.Control
                    type="text"
                    name="prepaymentAmount"
                    value={loanDetails.prepaymentAmount}
                    onChange={handleInputChange}
                    placeholder="e.g., 5L or 1Cr"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Prepayment Frequency</Form.Label>
                  <Form.Select
                    name="prepaymentFrequency"
                    value={loanDetails.prepaymentFrequency}
                    onChange={handleInputChange}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-time</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  id="calculate-prepayment-btn"
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mt-3 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calculator me-2"></i>Calculate
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        {results && (
          <Col lg={8} md={6}>
            <Card className="mt-4 shadow-sm border-0 bg-gradient" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e5f4ff)' }}>
              <Card.Header className="bg-transparent border-bottom py-3">
                <h5 className="mb-0 fw-bold"><i className="bi bi-piggy-bank-fill text-primary me-2"></i>Prepayment Benefits</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="gy-4 mb-3">
                  <Col md={6} className="text-center">
                    <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                      <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-clock-history text-success fs-4"></i>
                      </div>
                      <h3 className="display-6 fw-bold text-success mb-1">
                        {Math.floor(results.withPrepayment.timeShortened / 12)} years, {results.withPrepayment.timeShortened % 12} months
                      </h3>
                      <p className="text-muted mb-0">Time Saved</p>
                    </div>
                  </Col>
                  <Col md={6} className="text-center">
                    <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-cash-coin text-primary fs-4"></i>
                      </div>
                      <h3 className="display-6 fw-bold text-primary mb-1">
                        {formatIndianCurrency(results.withPrepayment.interestSaved)}
                      </h3>
                      <p className="text-muted mb-0">Interest Saved</p>
                    </div>
                  </Col>
                </Row>
                <small className="text-muted mt-2 d-block">
                  That's {((results.withPrepayment.interestSaved / results.regularLoan.totalInterest) * 100).toFixed(1)}% of total interest
                </small>
                <Table bordered size="sm" className="mt-3">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Regular Payment</th>
                      <th>With Prepayment</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Principal Amount</td>
                      <td>{formatIndianCurrency(parseFloat(loanDetails.loanAmount))}</td>
                      <td>{formatIndianCurrency(parseFloat(loanDetails.loanAmount))}</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td>Monthly Payment</td>
                      <td>{formatIndianCurrency(results.regularLoan.monthlyPayment)}</td>
                      <td>{formatIndianCurrency(results.withPrepayment.monthlyPayment)}</td>
                      <td className="text-muted">Same</td>
                    </tr>
                    <tr>
                      <td>Total Payment</td>
                      <td>{formatIndianCurrency(results.regularLoan.totalPayment)}</td>
                      <td>{formatIndianCurrency(results.withPrepayment.totalPayment)}</td>
                      <td className="text-success fw-bold">{formatIndianCurrency(results.regularLoan.totalPayment - results.withPrepayment.totalPayment)} saved</td>
                    </tr>
                    <tr>
                      <td>Total Interest</td>
                      <td>{formatIndianCurrency(results.regularLoan.totalInterest)}</td>
                      <td>{formatIndianCurrency(results.withPrepayment.totalInterest)}</td>
                      <td className="text-success fw-bold">{formatIndianCurrency(results.regularLoan.totalInterest - results.withPrepayment.totalInterest)} saved</td>
                    </tr>
                    <tr>
                      <td>Loan Term</td>
                      <td>{Math.floor(results.regularLoan.termMonths / 12)} years, {results.regularLoan.termMonths % 12} months</td>
                      <td>{Math.floor(results.withPrepayment.termMonths / 12)} years, {results.withPrepayment.termMonths % 12} months</td>
                      <td className="text-success fw-bold">{Math.floor(results.withPrepayment.timeShortened / 12)} years, {results.withPrepayment.timeShortened % 12} months saved</td>
                    </tr>
                    <tr>
                      <td>Total Prepayments</td>
                      <td>₹0</td>
                      <td className="fw-bold">{formatIndianCurrency(results.withPrepayment.totalPrepayments || getPrepaymentsMade(results.withPrepayment.schedule, Math.ceil(results.withPrepayment.termMonths / 12)))}</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      
      <Row className="mt-4">
        <Col lg={12}>
          {results && (
            <>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                  <h5 className="mb-0 fw-bold"><i className="bi bi-graph-down-arrow text-primary me-2"></i>Loan Timeline Visualization</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  {results && results.regularLoan && results.withPrepayment ? (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center">
                          <span className="badge bg-danger me-2 p-2">Regular Loan</span>
                          <span>{formatLoanTerm(results.regularLoan.termMonths)}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-success me-2 p-2">With Prepayment</span>
                          <span>{formatLoanTerm(results.withPrepayment.termMonths)}</span>
                        </div>
                      </div>
                      
                      {/* Interactive timeline visualization */}
                      <div className="timeline-container mb-4">
                        <div className="timeline-track position-relative" style={{ height: '100px', padding: '20px 0' }}>
                          {/* Timeline base line */}
                          <div style={{
                            position: 'absolute',
                            height: '4px',
                            backgroundColor: '#e9ecef',
                            top: '50%',
                            left: '0',
                            right: '0',
                            transform: 'translateY(-50%)',
                            borderRadius: '2px',
                            zIndex: 1
                          }}></div>
                          
                          {/* Year markers */}
                          <div className="d-flex justify-content-between position-relative" style={{ height: '100%' }}>
                            {Array.from({ length: Math.ceil(results.regularLoan.termMonths / 12) + 1 }).map((_, index) => {
                              const year = index;
                              const isSelected = selectedYear === year;
                              const regularPrincipal = getRemainingPrincipal(results.regularLoan.schedule, year);
                              const prepaymentPrincipal = getRemainingPrincipal(results.withPrepayment.schedule, year);
                              const isPaidOff = prepaymentPrincipal <= 0 && regularPrincipal > 0;
                              
                              return (
                                <div 
                                  key={`year-${year}`}
                                  className="timeline-year-marker text-center"
                                  style={{
                                    cursor: 'pointer',
                                    width: `${100 / Math.ceil(results.regularLoan.termMonths / 12)}%`,
                                    position: 'relative',
                                    zIndex: 5
                                  }}
                                  onClick={() => handleYearClick(year)}
                                >
                                  <div 
                                    className={`marker-dot mx-auto ${isSelected ? 'selected' : ''} ${isPaidOff ? 'paid-off' : ''}`}
                                    style={{
                                      width: isSelected ? '24px' : '16px',
                                      height: isSelected ? '24px' : '16px',
                                      borderRadius: '50%',
                                      backgroundColor: isPaidOff ? '#28a745' : isSelected ? '#4361ee' : '#adb5bd',
                                      border: `2px solid ${isSelected ? '#4361ee' : '#fff'}`,
                                      marginBottom: '8px',
                                      transition: 'all 0.2s ease',
                                      boxShadow: isSelected ? '0 0 0 4px rgba(67, 97, 238, 0.25)' : 'none'
                                    }}
                                  ></div>
                                  <div className="year-label" style={{ fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal' }}>
                                    Year {year}
                                  </div>
                                  {isPaidOff && (
                                    <div className="paid-off-label" style={{ fontSize: '0.7rem', color: '#28a745', fontWeight: 'bold' }}>
                                      Paid Off!
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Year details section */}
                      {selectedYear !== null && yearDetails && (
                        <div className="year-details p-3 border rounded bg-light shadow-sm">
                          <h6 className="fw-bold mb-3">Year {selectedYear} Comparison</h6>
                          <Row className="g-3">
                            <Col md={6}>
                              <div className="card border-danger h-100">
                                <div className="card-header bg-danger text-white py-2 fw-bold">Regular Loan</div>
                                <div className="card-body p-3">
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Remaining Principal</small>
                                    <h5 className="mb-0">{formatIndianCurrency(yearDetails.regular.remainingPrincipal)}</h5>
                                  </div>
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Interest Paid So Far</small>
                                    <h5 className="mb-0">{formatIndianCurrency(yearDetails.regular.interestPaid)}</h5>
                                  </div>
                                  <ProgressBar 
                                    variant="danger" 
                                    now={(yearDetails.regular.interestPaid / results.regularLoan.totalInterest) * 100} 
                                    label={`${Math.round((yearDetails.regular.interestPaid / results.regularLoan.totalInterest) * 100)}%`} 
                                    className="mt-3"
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="card border-success h-100">
                                <div className="card-header bg-success text-white py-2 fw-bold">With Prepayment</div>
                                <div className="card-body p-3">
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Remaining Principal</small>
                                    <h5 className="mb-0">{formatIndianCurrency(yearDetails.withPrepayment.remainingPrincipal)}</h5>
                                  </div>
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Interest Paid So Far</small>
                                    <h5 className="mb-0">{formatIndianCurrency(yearDetails.withPrepayment.interestPaid)}</h5>
                                  </div>
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Prepayments Made</small>
                                    <h5 className="mb-0">{formatIndianCurrency(yearDetails.withPrepayment.prepaymentsMade)}</h5>
                                  </div>
                                  <ProgressBar 
                                    variant="success" 
                                    now={(yearDetails.withPrepayment.interestPaid / results.withPrepayment.totalInterest) * 100} 
                                    label={`${Math.round((yearDetails.withPrepayment.interestPaid / results.withPrepayment.totalInterest) * 100)}%`} 
                                    className="mt-3"
                                  />
                                </div>
                              </div>
                            </Col>
                          </Row>
                          <div className="mt-3 p-3 bg-white rounded border">
                            <h6 className="fw-bold text-primary">Savings at Year {selectedYear}</h6>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <div>
                                <span className="fw-bold">Interest Saved:</span> 
                                <span className="text-success ms-2">
                                  {formatIndianCurrency(yearDetails.regular.interestPaid - yearDetails.withPrepayment.interestPaid)}
                                </span>
                              </div>
                              <div>
                                <span className="fw-bold">Principal Reduction:</span> 
                                <span className="text-success ms-2">
                                  {formatIndianCurrency(yearDetails.regular.remainingPrincipal - yearDetails.withPrepayment.remainingPrincipal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Summary section */}
                      <div className="text-center mt-4">
                        <Row className="g-3">
                          <Col md={6}>
                            <div className="p-3 rounded-3 bg-white shadow-sm h-100 border">
                              <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-clock-history text-success fs-4"></i>
                              </div>
                              <h3 className="display-6 fw-bold text-success mb-1">
                                {Math.floor(results.withPrepayment.timeShortened / 12)} years, {results.withPrepayment.timeShortened % 12} months
                              </h3>
                              <p className="text-muted mb-0">Time Saved</p>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="p-3 rounded-3 bg-white shadow-sm h-100 border">
                              <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-cash-coin text-primary fs-4"></i>
                              </div>
                              <h3 className="display-6 fw-bold text-primary mb-1">
                                {formatIndianCurrency(results.withPrepayment.interestSaved)}
                              </h3>
                              <p className="text-muted mb-0">Interest Saved</p>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading comparison data...</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
              
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-primary text-white">Prepayment Schedule</Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped hover size="sm">
                      <thead>
                        <tr>
                          <th>Payment #</th>
                          <th>Payment</th>
                          <th>Principal</th>
                          <th>Interest</th>
                          <th>Prepayment</th>
                          <th>Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.prepaymentSchedule
                          .slice((currentPage - 1) * paymentsPerPage, currentPage * paymentsPerPage)
                          .map(payment => (
                            <tr key={payment.month}>
                              <td>{payment.month}</td>
                              <td>{formatIndianCurrency(payment.payment)}</td>
                              <td>{formatIndianCurrency(payment.principal)}</td>
                              <td>{formatIndianCurrency(payment.interest)}</td>
                              <td>{formatIndianCurrency(payment.prepayment)}</td>
                              <td>{formatIndianCurrency(payment.balance)}</td>
                            </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  
                  {results.prepaymentSchedule.length > paymentsPerPage && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <small className="text-muted">
                          Showing payments {(currentPage - 1) * paymentsPerPage + 1} to {Math.min(currentPage * paymentsPerPage, results.prepaymentSchedule.length)} of {results.prepaymentSchedule.length}
                        </small>
                      </div>
                      <Pagination className="mb-0">
                        <Pagination.First 
                          onClick={() => setCurrentPage(1)} 
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                          disabled={currentPage === 1}
                        />
                        
                        {/* Show up to 5 page numbers */}
                        {Array.from({ length: Math.min(5, Math.ceil(results.prepaymentSchedule.length / paymentsPerPage)) }, (_, i) => {
                          // Calculate which page numbers to show
                          let pageNum;
                          const totalPages = Math.ceil(results.prepaymentSchedule.length / paymentsPerPage);
                          
                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            // If near the start, show first 5 pages
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // If near the end, show last 5 pages
                            pageNum = totalPages - 4 + i;
                          } else {
                            // Otherwise show current page and 2 on each side
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Pagination.Item 
                              key={pageNum} 
                              active={pageNum === currentPage}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        })}
                        
                        <Pagination.Next 
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(results.prepaymentSchedule.length / paymentsPerPage), prev + 1))} 
                          disabled={currentPage === Math.ceil(results.prepaymentSchedule.length / paymentsPerPage)}
                        />
                        <Pagination.Last 
                          onClick={() => setCurrentPage(Math.ceil(results.prepaymentSchedule.length / paymentsPerPage))} 
                          disabled={currentPage === Math.ceil(results.prepaymentSchedule.length / paymentsPerPage)}
                        />
                      </Pagination>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PrepaymentCalculator;
