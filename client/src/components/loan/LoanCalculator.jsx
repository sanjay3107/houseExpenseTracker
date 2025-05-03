import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, ProgressBar, Table, Alert, Pagination } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { formatIndianCurrency, parseIndianAmount } from '../../utils/currencyFormatter';
import API_ENDPOINTS from '../../config/api';
import '../../styles/calculator.css';

const LoanCalculator = () => {
  const [loanDetails, setLoanDetails] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: ''
  });
  
  const [results, setResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 12; // Show 1 year of payments per page
  const [houseDetails, setHouseDetails] = useState(null);
  const [useExistingLoan, setUseExistingLoan] = useState(false);

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
            setLoanDetails({
              loanAmount: response.data.loan_details.loan_amount,
              interestRate: response.data.loan_details.interest_rate,
              loanTerm: response.data.loan_details.loan_term
            });
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
    
    // Convert lakh/crore notation to absolute number for loan amount
    if (name === 'loanAmount') {
      parsedValue = parseIndianAmount(value);
    }
    
    setLoanDetails(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleUseExistingLoan = () => {
    if (houseDetails && houseDetails.loan_details) {
      setLoanDetails({
        loanAmount: houseDetails.loan_details.loan_amount,
        interestRate: houseDetails.loan_details.interest_rate,
        loanTerm: houseDetails.loan_details.loan_term
      });
      setUseExistingLoan(true);
      
      // Automatically calculate when using existing loan details
      setTimeout(() => {
        document.getElementById('calculate-loan-btn').click();
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate inputs
      if (
        isNaN(loanDetails.loanAmount) || 
        isNaN(loanDetails.interestRate) || 
        isNaN(loanDetails.loanTerm) ||
        parseFloat(loanDetails.loanAmount) <= 0 ||
        parseFloat(loanDetails.interestRate) <= 0 ||
        parseFloat(loanDetails.loanTerm) <= 0
      ) {
        setError('Please enter valid values for all fields.');
        setLoading(false);
        return;
      }
      
      // Calculate monthly payment
      const monthlyPaymentResponse = await axios.post(
        API_ENDPOINTS.LOAN.CALCULATE,
        {
          loanAmount: parseFloat(loanDetails.loanAmount),
          interestRate: parseFloat(loanDetails.interestRate),
          loanTerm: parseFloat(loanDetails.loanTerm)
        }
      );
      
      // Get amortization schedule
      const amortizationResponse = await axios.post(
        API_ENDPOINTS.LOAN.CALCULATE,
        {
          loanAmount: parseFloat(loanDetails.loanAmount),
          interestRate: parseFloat(loanDetails.interestRate),
          loanTerm: parseFloat(loanDetails.loanTerm)
        }
      );
      
      const data = {
        monthlyPayment: monthlyPaymentResponse.data.monthlyPayment,
        totalPayment: monthlyPaymentResponse.data.totalPayment,
        totalInterest: monthlyPaymentResponse.data.totalInterest,
        amortizationSchedule: amortizationResponse.data.schedule
      };
      
      setResults(data);
      setAmortizationSchedule(data.amortizationSchedule);
      setLoading(false);
      setCurrentPage(1); // Reset to first page when new calculations are performed
    } catch (err) {
      setError('Error calculating loan details. Please try again.');
      console.error('Loan calculation error:', err);
      setLoading(false);
    }
  };

  // Prepare chart data for amortization schedule
  const getChartData = () => {
    if (!amortizationSchedule || amortizationSchedule.length === 0) return null;
    
    // Group data by year
    const yearlyData = {};
    
    amortizationSchedule.forEach(payment => {
      const year = Math.ceil(payment.month / 12);
      
      if (!yearlyData[year]) {
        yearlyData[year] = {
          principal: 0,
          interest: 0
        };
      }
      
      yearlyData[year].principal += payment.principal;
      yearlyData[year].interest += payment.interest;
    });
    
    const years = Object.keys(yearlyData);
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Principal',
          data: years.map(year => yearlyData[year].principal),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Interest',
          data: years.map(year => yearlyData[year].interest),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Yearly Payment Breakdown'
      }
    },
    scales: {
      x: {
        stacked: false,
        title: {
          display: true,
          text: 'Year'
        }
      },
      y: {
        stacked: false,
        title: {
          display: true,
          text: 'Amount (₹)'
        }
      }
    }
  };

  return (
    <div className="loan-calculator-container">
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h1 className="mb-0"><i className="bi bi-calculator-fill text-primary me-2"></i>Loan Calculator</h1>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="g-4 mb-4">
        <Col lg={4} md={6}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-primary text-white py-3 fw-bold">
              <i className="bi bi-bank me-2"></i>Loan Details
            </Card.Header>
            <Card.Body className="p-4">
              {houseDetails && houseDetails.loanDetails && !useExistingLoan && (
                <Alert variant="info" className="mb-3">
                  You have existing loan details in your house profile.
                  <Button 
                    variant="outline-primary" 
                    className="mb-4 w-100 py-2"
                    onClick={handleUseExistingLoan}
                  >
                    <i className="bi bi-house-check me-2"></i>Use My House Loan Details
                  </Button>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Loan Amount (₹)</Form.Label>
                  <Form.Text className="text-muted d-block mb-1">
                    You can enter values like "60L" for 60 lakhs or "1.5Cr" for 1.5 crores
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
                    placeholder="e.g., 30"
                    min="1"
                    max="50"
                    required
                  />
                </Form.Group>
                
                <Button 
                  id="calculate-loan-btn"
                  type="submit" 
                  className="w-100 py-2 mt-3 fw-bold" 
                  variant="primary"
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

        <Col lg={8} md={6}>
          {loading ? (
            <div className="text-center py-5 my-3 bg-light rounded-3">
              <div className="spinner-grow text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="mt-3 text-primary">Calculating loan details...</h5>
              <p className="text-muted">This may take a moment</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : results && (
            <>
              <Card className="shadow-sm border-0 bg-gradient mb-4" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9f7ef)' }}>
                <Card.Header className="bg-transparent border-bottom py-3">
                  <h5 className="mb-0 fw-bold"><i className="bi bi-pie-chart-fill text-success me-2"></i>Loan Summary</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="gy-4 mb-4">
                    <Col md={4} className="text-center">
                      <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-calendar-check text-primary fs-4"></i>
                        </div>
                        <h3 className="display-6 fw-bold text-primary mb-1">{formatIndianCurrency(results.monthlyPayment)}</h3>
                        <p className="text-muted mb-0">Monthly Payment</p>
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                        <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-cash-stack text-success fs-4"></i>
                        </div>
                        <h3 className="display-6 fw-bold text-success mb-1">{formatIndianCurrency(results.totalPayment)}</h3>
                        <p className="text-muted mb-0">Total Payment</p>
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="p-3 rounded-3 bg-white shadow-sm h-100">
                        <div className="rounded-circle bg-danger bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-graph-up-arrow text-danger fs-4"></i>
                        </div>
                        <h3 className="display-6 fw-bold text-danger mb-1">{formatIndianCurrency(results.totalInterest)}</h3>
                        <p className="text-muted mb-0">Total Interest</p>
                      </div>
                    </Col>
                  </Row>
                  
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">Interest to Principal Ratio</h6>
                    <div className="d-flex align-items-baseline">
                      <h4 className="display-6 fw-bold text-warning mb-1">
                        {((results.totalInterest / parseFloat(loanDetails.loanAmount)) * 100).toFixed(2)}%
                      </h4>
                      <small className="text-muted ms-2">of total payment is interest</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                  <h5 className="mb-0 fw-bold"><i className="bi bi-bar-chart-fill text-primary me-2"></i>Payment Distribution</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div style={{ height: '400px' }}>
                    <Bar data={getChartData()} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                  <h5 className="mb-0 fw-bold"><i className="bi bi-table text-primary me-2"></i>Amortization Schedule</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">Payment #</th>
                          <th className="border-0">Payment</th>
                          <th className="border-0">Principal</th>
                          <th className="border-0">Interest</th>
                          <th className="border-0">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {amortizationSchedule
                          .slice((currentPage - 1) * paymentsPerPage, currentPage * paymentsPerPage)
                          .map(payment => (
                            <tr key={payment.month}>
                              <td>{payment.month}</td>
                              <td>{formatIndianCurrency(payment.payment)}</td>
                              <td>{formatIndianCurrency(payment.principal)}</td>
                              <td>{formatIndianCurrency(payment.interest)}</td>
                              <td>{formatIndianCurrency(payment.balance)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                  
                  {amortizationSchedule.length > paymentsPerPage && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <small className="text-muted">
                          Showing payments {(currentPage - 1) * paymentsPerPage + 1} to {Math.min(currentPage * paymentsPerPage, amortizationSchedule.length)} of {amortizationSchedule.length}
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
                        {Array.from({ length: Math.min(5, Math.ceil(amortizationSchedule.length / paymentsPerPage)) }, (_, i) => {
                          // Calculate which page numbers to show
                          let pageNum;
                          const totalPages = Math.ceil(amortizationSchedule.length / paymentsPerPage);
                          
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
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(amortizationSchedule.length / paymentsPerPage), prev + 1))} 
                          disabled={currentPage === Math.ceil(amortizationSchedule.length / paymentsPerPage)}
                        />
                        <Pagination.Last 
                          onClick={() => setCurrentPage(Math.ceil(amortizationSchedule.length / paymentsPerPage))} 
                          disabled={currentPage === Math.ceil(amortizationSchedule.length / paymentsPerPage)}
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

export default LoanCalculator;
